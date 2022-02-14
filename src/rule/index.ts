import { ErrorObject } from 'ajv';
import { Diff } from 'deep-diff';
import { LogLevel } from 'noicejs';

import { Document, Element } from '../source.js';
import { Context } from '../visitor/index.js';
import { VisitorContext } from '../visitor/VisitorContext.js';

export interface RuleData {
  // metadata
  desc: string;
  level: LogLevel;
  name: string;
  tags: Array<string>;
  // data
  check: object;
  filter?: object;
  select: string;
}

export interface ValidatorResult {
  errors: Array<ErrorObject>;
  valid: boolean;
}

export interface Rule {
  desc?: string;
  level: LogLevel;
  name: string;
  select: string;
  tags: Array<string>;

  check(ctx: Context, elem: Element): Promise<ValidatorResult>;
  filter(ctx: Context, elem: Element): Promise<ValidatorResult>;

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
  err: ErrorObject;
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
