import * as Ajv from 'ajv';
import { Logger } from 'noicejs';

export interface VisitorContextOptions {
  coerce: boolean;
  defaults: boolean;
  logger: Logger;
}

export class VisitorContext {
  public readonly ajv: any;
  public readonly changes: Array<any>;
  public readonly coerce: boolean;
  public readonly defaults: boolean;
  public readonly errors: Array<any>;
  public readonly logger: Logger;

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
  }

  public error(options: any, msg: string) {
    this.logger.error(options, msg);
    this.errors.push(options || msg);
  }
}