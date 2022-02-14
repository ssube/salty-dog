import { ValidateFunction } from 'ajv';
import EventEmitter from 'events';

import { Rule, RuleChange, RuleError, RuleResult } from '../rule/index.js';
import { Document, Element } from '../source.js';

export interface Context {
  compile(schema: object): ValidateFunction;

  changes: ReadonlyArray<RuleChange>;
  errors: ReadonlyArray<RuleError>;
}

export interface Visitor extends EventEmitter {
  /**
   * Select nodes eligible to be visited.
   */
  pick(ctx: Context, rule: Rule, doc: Document): Promise<Array<Element>>;

  /**
   * Visit a node.
   */
  visit(ctx: Context, rule: Rule, elem: Element): Promise<RuleResult>;

  visitAll(ctx: Context, rule: Rule, doc: Document): Promise<Array<RuleResult>>;
}
