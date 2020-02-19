import { ErrorObject, ValidateFunction } from 'ajv';
import { cloneDeep, defaultTo, isNil } from 'lodash';
import { LogLevel } from 'noicejs';

import { Rule, RuleData } from '.';
import { doesExist, hasItems } from '../utils';
import { Visitor, VisitorError, VisitorResult } from '../visitor';
import { RuleVisitorContext } from './RuleVisitor';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/strict-boolean-expressions */

const DEFAULT_FILTER = () => true;

export class SchemaRule implements Rule, RuleData, Visitor {
  public readonly check: ValidateFunction;
  public readonly desc: string;
  public readonly filter?: ValidateFunction;
  public readonly level: LogLevel;
  public readonly name: string;
  public readonly select: string;
  public readonly tags: Array<string>;

  constructor(data: RuleData) {
    this.desc = data.desc;
    this.level = data.level;
    this.name = data.name;
    this.select = defaultTo(data.select, '$');
    this.tags = Array.from(data.tags);

    // copy schema objects
    this.check = cloneDeep(data.check);
    if (doesExist(data.filter)) {
      this.filter = cloneDeep(data.filter);
    }
  }

  public async pick(ctx: RuleVisitorContext, root: any): Promise<Array<any>> {
    const items = ctx.pick(this.select, root);

    if (items.length === 0) {
      ctx.logger.debug('no data selected');
    }

    return items;
  }

  public async visit(ctx: RuleVisitorContext, node: any): Promise<VisitorResult> {
    ctx.logger.debug({ item: node, rule: this }, 'visiting node');

    const check = ctx.compile(this.check);
    const filter = this.compileFilter(ctx);
    const errors: Array<VisitorError> = [];
    const result: VisitorResult = {
      changes: [],
      errors,
    };

    if (filter(node)) {
      ctx.logger.debug({ item: node }, 'checking item');
      if (!check(node) && hasItems(check.errors)) {
        errors.push(...check.errors.map((err) => friendlyError(ctx, err)));
      }
    } else {
      ctx.logger.debug({ errors: filter.errors, item: node }, 'skipping item');
    }

    return result;
  }

  protected compileFilter(ctx: RuleVisitorContext): ValidateFunction {
    if (isNil(this.filter)) {
      return DEFAULT_FILTER;
    } else {
      return ctx.compile(this.filter);
    }
  }
}

export function friendlyError(ctx: RuleVisitorContext, err: ErrorObject): VisitorError {
  return {
    data: {
      err,
    },
    level: LogLevel.Error,
    msg: friendlyErrorMessage(ctx, err),
  };
}

export function friendlyErrorMessage(ctx: RuleVisitorContext, err: ErrorObject): string {
  const msg = [err.dataPath];
  if (isNil(err.message)) {
    msg.push(err.keyword);
  } else {
    msg.push(err.message);
  }
  msg.push('at', 'item', ctx.visitData.itemIndex.toString());
  msg.push('of', ctx.visitData.rule.select);
  msg.push('for', ctx.visitData.rule.name);

  return msg.join(' ');
}
