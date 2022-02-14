import Ajv, { ValidateFunction } from 'ajv';
import { Logger } from 'noicejs';

import { Rule, RuleChange, RuleError, RuleResult } from '../rule/index.js';
import { Element } from '../source.js';

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

  public mergeResult(rule: Rule, elem: Element, result: RuleResult): this {
    this.changeBuffer.push(...result.changes);
    this.errorBuffer.push(...result.errors);
    return this;
  }
}
