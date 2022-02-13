import { ValidateFunction } from 'ajv';
import { Diff } from 'deep-diff';
import { LogLevel } from 'noicejs';

import { Document, Element } from '../source.js';
import { VisitorContext } from '../visitor/VisitorContext.js';

export interface RuleData {
  // metadata
  desc: string;
  level: LogLevel;
  name: string;
  tags: Array<string>;
  // data
  check: unknown;
  filter?: unknown;
  select: string;
}

export type Validator = ValidateFunction;

export interface Rule {
  check: Validator;
  desc?: string;
  filter?: Validator;
  level: LogLevel;
  name: string;
  select: string;
  tags: Array<string>;

  pick(ctx: VisitorContext, root: Document): Promise<Array<Element>>;
  visit(ctx: VisitorContext, item: Element): Promise<RuleResult>;
}

export interface RuleChange {
  data: Element;
  diff: Diff<unknown, unknown>;
  rule: Rule;
}

export interface RuleError {
  data: Element;
  level: LogLevel;
  msg: string;
  rule: Rule;
}

export interface RuleResult {
  changes: ReadonlyArray<RuleChange>;
  errors: ReadonlyArray<RuleError>;
}

export function isPOJSO(val: object): val is RuleData {
  return Reflect.getPrototypeOf(val) === Reflect.getPrototypeOf({});
}
