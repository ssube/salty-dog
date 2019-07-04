import * as Ajv from 'ajv';
import { Logger } from 'noicejs';

import { VisitorResult } from 'src/visitor/result';

export interface VisitorContextOptions {
  coerce: boolean;
  defaults: boolean;
  logger: Logger;
  mutate: boolean;
}

export class VisitorContext implements VisitorContextOptions, VisitorResult {
  public readonly ajv: any;
  public readonly changes: Array<any>;
  public readonly coerce: boolean;
  public readonly defaults: boolean;
  public readonly errors: Array<any>;
  public readonly logger: Logger;
  public readonly mutate: boolean;

  constructor(options: VisitorContextOptions) {
    this.ajv = new ((Ajv as any).default)({
      coerceTypes: options.coerce,
      useDefaults: options.defaults,
    });
    this.changes = [];
    this.coerce = options.coerce;
    this.defaults = options.defaults;
    this.errors = [];
    this.logger = options.logger;
    this.mutate = options.mutate;
  }

  public error(options: any, msg: string) {
    this.logger.error(options, msg);
    this.errors.push(options || msg);
  }

  public mergeResult(other: VisitorResult): this {
    this.changes.push(...other.changes);
    this.errors.push(...other.errors);
    return this;
  }
}
