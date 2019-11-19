import Ajv from 'ajv';
import { JSONPath } from 'jsonpath-plus';
import { Logger } from 'noicejs';

import { VisitorError, VisitorResult } from '.';
import { Rule } from '../rule';
import { doesExist, hasItems, mustExist } from '../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RuleOptions {
  coerce: boolean;
  defaults: boolean;
  mutate: boolean;
}

export interface VisitorContextOptions {
  logger: Logger;
  schemaOptions: RuleOptions;
}

export interface VisitorContextFlash {
  item: unknown;
  itemIndex: number;
  rule: Rule;
}

export class VisitorContext implements VisitorContextOptions, VisitorResult {
  public readonly logger: Logger;
  public readonly schemaOptions: RuleOptions;

  protected readonly ajv: Ajv.Ajv;
  protected readonly changeBuffer: Array<any>;
  protected readonly errorBuffer: Array<VisitorError>;
  protected data?: VisitorContextFlash;

  public get changes(): ReadonlyArray<any> {
    return this.changeBuffer;
  }

  public get errors(): ReadonlyArray<VisitorError> {
    return this.errorBuffer;
  }

  constructor(options: VisitorContextOptions) {
    this.changeBuffer = [];
    this.errorBuffer = [];

    this.ajv = new Ajv({
      $data: true,
      coerceTypes: options.schemaOptions.coerce,
      useDefaults: options.schemaOptions.defaults,
    });

    this.logger = options.logger;
    this.schemaOptions = options.schemaOptions;
  }

  public addSchema(name: string, schema: any): void {
    this.logger.debug({
      schema,
      schemaName: name,
    }, 'adding ajv schema');

    this.ajv.addSchema({
      $id: name,
      definitions: schema,
    });
  }

  public compile(schema: any): Ajv.ValidateFunction {
    return this.ajv.compile(schema);
  }

  public mergeResult(other: VisitorResult, data: any = {}): this {
    this.changeBuffer.push(...other.changes);
    this.errorBuffer.push(...other.errors.map((err) => ({
      ...err,
      data: {
        ...err.data,
        ...data,
      },
    })));
    return this;
  }

  public pick(path: string, root: any): Array<any> {
    const items = JSONPath({
      json: root,
      path,
    });

    this.logger.debug({
      items,
      path,
    }, 'path query picked items');

    if (hasItems(items)) {
      return items.filter(doesExist);
    } else {
      return [];
    }
  }

  /**
   * Store some flash data about the item and rule being visited.
   *
   * TODO: This is not the best way to do it and could use work.
   */
  public get visitData(): VisitorContextFlash {
    return mustExist(this.data);
  }

  public set visitData(value: VisitorContextFlash) {
    this.data = value;
  }
}
