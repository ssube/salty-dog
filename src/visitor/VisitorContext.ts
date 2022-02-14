import Ajv, { ValidateFunction } from 'ajv';
import { Logger } from 'noicejs';

import { RuleChange, RuleError, RuleResult } from '../rule/index.js';

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

  public addSchema(name: string, schema: object): void {
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

  /**
   * @TODO what is data? should use the element
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
}
