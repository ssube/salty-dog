import Ajv from 'ajv';
import { Logger, logWithLevel } from 'noicejs';

import { VisitorError } from './VisitorError';
import { VisitorResult } from './VisitorResult';

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
      coerceTypes: options.innerOptions.coerce,
      useDefaults: options.innerOptions.defaults,
    });

    this.logger = options.logger;
    this.innerOptions = options.innerOptions;
  }

  public error(...errors: Array<VisitorError>) {
    for (const err of errors) {
      logWithLevel(this.logger, err.level, err.data, err.msg);
    }

    this.errorBuffer.push(...errors);
  }

  public mergeResult(other: VisitorResult): this {
    this.changeBuffer.push(...other.changes);
    this.errorBuffer.push(...other.errors);
    return this;
  }

  public compile(schema: any): Ajv.ValidateFunction {
    return this.ajv.compile(schema);
  }

  public addSchema(name: string, schema: any): void {
    this.logger.debug('adding ajv schema', {
      name,
      schema,
    });

    this.ajv.addSchema({
      $id: name,
      definitions: schema,
    });
  }
}
