import Ajv from 'ajv';
import { JSONPath } from 'jsonpath-plus';
import { Logger } from 'noicejs';

import { VisitorError, VisitorResult } from '.';
import { doesExist, hasItems } from '../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RuleOptions {
  coerce: boolean;
  defaults: boolean;
  mutate: boolean;
}

export interface VisitorContextOptions {
  logger: Logger;
  innerOptions: RuleOptions;
}

export class VisitorContext implements VisitorContextOptions, VisitorResult {
  public readonly logger: Logger;
  public readonly innerOptions: RuleOptions;

  protected readonly ajv: Ajv.Ajv;
  protected readonly changeBuffer: Array<any>;
  protected readonly errorBuffer: Array<VisitorError>;
  protected data: any;

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
      coerceTypes: options.innerOptions.coerce,
      useDefaults: options.innerOptions.defaults,
    });

    this.logger = options.logger;
    this.innerOptions = options.innerOptions;
  }

  public addSchema(name: string, schema: any): void {
    this.logger.debug({
      name,
      schema,
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
    this.errorBuffer.push(...other.errors.map((err) => {
      return {
        ...err,
        data: {
          ...err.data,
          ...data,
        },
      };
    }));
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
   * store some flash data. this is very much not the right way to do it.
   *
   * @TODO: fix this
   */
  public get visitData(): any {
    return this.data;
  }

  public set visitData(value: any) {
    this.data = value;
  }
}
