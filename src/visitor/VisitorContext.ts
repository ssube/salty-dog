import Ajv from 'ajv';
import { JSONPath } from 'jsonpath-plus';
import { Logger } from 'noicejs';

import { VisitorError, VisitorResult } from '.';
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

export class VisitorContext<TData, TError extends TData> implements VisitorContextOptions, VisitorResult<TError> {
  public readonly logger: Logger;
  public readonly schemaOptions: RuleOptions;

  protected readonly ajv: Ajv.Ajv;
  protected readonly changeBuffer: Array<any>;
  protected readonly errorBuffer: Array<VisitorError>;
  protected data?: TData;

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
   */
  public get visitData(): TData {
    return mustExist(this.data);
  }

  public set visitData(value: TData) {
    this.data = value;
  }
}
