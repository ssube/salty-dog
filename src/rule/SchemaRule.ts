import { ValidateFunction } from 'ajv';
import { JSONPath } from 'jsonpath-plus';
import { cloneDeep, defaultTo, isNil } from 'lodash';
import { LogLevel } from 'noicejs';

import { RuleData } from '.';
import { hasItems } from '../utils';
import { friendlyError } from '../utils/ajv';
import { Visitor } from '../visitor';
import { VisitorContext } from '../visitor/VisitorContext';
import { VisitorError } from '../visitor/VisitorError';
import { VisitorResult } from '../visitor/VisitorResult';

export interface RuleResult extends VisitorResult {
  rule: SchemaRule;
}

export class SchemaRule implements RuleData, Visitor<RuleResult> {
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
    const scopes = JSONPath({
      json: root,
      path: this.select,
    });

    if (hasItems(scopes)) {
      return scopes;
    }

    ctx.logger.debug('no data selected');
    return [];
  }

  public async visit(ctx: VisitorContext, node: any): Promise<RuleResult> {
    ctx.logger.debug({ item: node, rule: this }, 'visiting node');

    const check = ctx.compile(this.check);
    const filter = this.compileFilter(ctx);
    const errors: Array<VisitorError> = [];
    const result: RuleResult = {
      changes: [],
      errors,
      rule: this,
    };

    if (filter(node)) {
      ctx.logger.debug({ item: node }, 'checking item');
      if (!check(node) && hasItems(check.errors)) {
        ctx.error(...Array.from(check.errors).map(friendlyError));
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
