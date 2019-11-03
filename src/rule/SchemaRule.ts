import { ErrorObject, ValidateFunction } from 'ajv';
import { cloneDeep, defaultTo, isNil } from 'lodash';
import { LogLevel } from 'noicejs';

import { Rule, RuleData } from '.';
import { hasItems } from '../utils';
import { Visitor, VisitorError, VisitorResult } from '../visitor';
import { VisitorContext } from '../visitor/VisitorContext';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/strict-boolean-expressions */

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
    if (!isNil(data.filter)) {
      this.filter = cloneDeep(data.filter);
    }
  }

  public async pick(ctx: VisitorContext, root: any): Promise<Array<any>> {
    const items = ctx.pick(this.select, root);

    if (items.length === 0) {
      ctx.logger.debug('no data selected');
    }

    return items;
  }

  public async visit(ctx: VisitorContext, node: any): Promise<VisitorResult> {
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
        errors.push(...check.errors.map((err) => friendlyError(ctx, err, this)));
      }
    } else {
      ctx.logger.debug({ errors: filter.errors, item: node }, 'skipping item');
    }

    return result;
  }

  protected compileFilter(ctx: VisitorContext): ValidateFunction {
    if (isNil(this.filter)) {
      return () => true;
    } else {
      return ctx.compile(this.filter);
    }
  }
}

export function friendlyError(ctx: VisitorContext, err: ErrorObject, rule: SchemaRule): VisitorError {
  return {
    data: {
      err,
      rule,
    },
    level: 'error',
    msg: friendlyErrorMessage(err, rule),
  };
}

export function friendlyErrorMessage(err: ErrorObject, rule: SchemaRule): string {
  if (isNil(err.message)) {
    return `${err.dataPath} ${err.keyword} at ${rule.select} for ${rule.name}`;
  } else {
    return `${err.dataPath} ${err.message} at ${rule.select} for ${rule.name}`;
  }
}
