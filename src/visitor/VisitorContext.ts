import { doesExist, hasItems } from '@apextoaster/js-utils';
import Ajv, { ValidateFunction } from 'ajv';
import { JSONPath } from 'jsonpath-plus';
import { Logger } from 'noicejs';

import { RuleChange, RuleError, RuleResult } from '../rule/index.js';

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

export class VisitorContext implements VisitorContextOptions, RuleResult {
  public readonly logger: Logger;
  public readonly schemaOptions: RuleOptions;

  protected readonly ajv: Ajv;
  protected readonly changeBuffer: Array<RuleChange>;
  protected readonly errorBuffer: Array<RuleError>;
  protected data: any;

  public get changes(): ReadonlyArray<RuleChange> {
    return this.changeBuffer;
  }

  public get errors(): ReadonlyArray<RuleError> {
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

  public compile(schema: object): ValidateFunction {
    return this.ajv.compile(schema);
  }

  public mergeResult(other: RuleResult, data: any = {}): this {
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

  /**
   * @TODO move to visitor
   */
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
   * store some flash data. this is very much not the right way to do it.
   *
   * @TODO fix this
   */
  public get visitData(): any {
    return this.data;
  }

  public set visitData(value: any) {
    this.data = value;
  }
}
