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
   * Select elements eligible to be visited.
   */
  pick(ctx: Context, rule: Rule, doc: Document): Promise<Array<Element>>;

  /**
   * Visit an element.
   */
  visit(ctx: Context, rule: Rule, elem: Element): Promise<RuleResult>;

  /**
   * Visit all selected elements within a document.
   */
  visitAll(ctx: Context, rule: Rule, doc: Document): Promise<Array<RuleResult>>;
}
