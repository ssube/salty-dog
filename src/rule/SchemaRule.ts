import { doesExist, ensureArray } from '@apextoaster/js-utils';
import { ErrorObject } from 'ajv';
import lodash from 'lodash';
import { LogLevel } from 'noicejs';

import { Document, Element } from '../source.js';
import { Context } from '../visitor/index.js';
import { VisitorContext } from '../visitor/VisitorContext.js';
import { Rule, RuleData, RuleError, RuleResult, ValidatorResult } from './index.js';

/* eslint-disable-next-line @typescript-eslint/unbound-method */
const { cloneDeep, defaultTo } = lodash;

export class SchemaRule implements Rule, RuleData {
  public readonly checkSchema: object;
  public readonly desc: string;
  public readonly filterSchema?: object;
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
    this.checkSchema = cloneDeep(data.check);
    if (doesExist(data.filter)) {
      this.filterSchema = cloneDeep(data.filter);
    }
  }

  public async check(ctx: Context, elem: Element): Promise<ValidatorResult> {
    const schema = ctx.compile(this.checkSchema);
    if (schema(elem.data)) {
      return {
        errors: [],
        valid: true,
      };
    } else {
      return {
        errors: ensureArray(schema.errors),
        valid: false,
      };
    }
  }

  public async filter(ctx: Context, elem: Element): Promise<ValidatorResult> {
    if (doesExist(this.filterSchema)) {
      const schema = ctx.compile(this.filterSchema);
      if (schema(elem.data)) {
        return {
          errors: [],
          valid: true,
        };
      } else {
        return {
          errors: ensureArray(schema.errors),
          valid: false,
        };
      }
    } else {
      return {
        errors: [],
        valid: true,
      };
    }
  }

  public async pick(ctx: VisitorContext, root: Document): Promise<Array<Element>> {
    const items = ctx.pick(this.select, root);

    if (items.length === 0) {
      ctx.logger.debug('no data selected');
    }

    return items;
  }

  public async visit(ctx: VisitorContext, elem: Element): Promise<RuleResult> {
    ctx.logger.debug({ item: elem, rule: this }, 'visiting node');

    const errors: Array<RuleError> = [];
    const result: RuleResult = {
      changes: [],
      errors,
    };

    const filter = await this.filter(ctx, elem);
    if (filter.valid) {
      ctx.logger.debug({ item: elem }, 'checking item');
      const check = await this.check(ctx, elem);
      if (check.valid === false) {
        errors.push(...check.errors.map((err) => friendlyError(ctx, err, elem, this)));
      }
    } else {
      ctx.logger.debug({ errors: filter.errors, item: elem }, 'skipping item');
    }

    return result;
  }
}

export function friendlyError(ctx: VisitorContext, err: ErrorObject, data: Element, rule: Rule): RuleError {
  return {
    data,
    err,
    level: LogLevel.Error,
    msg: friendlyErrorMessage(ctx, err, data, rule),
    rule,
  };
}

export function friendlyErrorMessage(ctx: VisitorContext, err: ErrorObject, data: Element, rule: Rule): string {
  const msg = [err.instancePath];
  if (doesExist(err.message)) {
    msg.push(err.message);
  } else {
    msg.push(err.keyword);
  }

  msg.push('at', 'item', data.index.toString());
  msg.push('of', rule.select);
  msg.push('for', rule.name);

  return msg.join(' ');
}
