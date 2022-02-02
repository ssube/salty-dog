import { hasItems } from '@apextoaster/js-utils';
import deepDiff from 'deep-diff';
import lodash from 'lodash';

import { Rule } from './index.js';
import { Visitor } from '../visitor/index.js';
import { VisitorContext } from '../visitor/VisitorContext.js';

const { applyDiff, diff } = deepDiff;
/* eslint-disable-next-line @typescript-eslint/unbound-method */
const { cloneDeep } = lodash;

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RuleVisitorOptions {
  rules: ReadonlyArray<Rule>;
}

export class RuleVisitor implements RuleVisitorOptions, Visitor {
  public readonly rules: ReadonlyArray<Rule>;

  constructor(options: RuleVisitorOptions) {
    this.rules = Array.from(options.rules);
  }

  public async pick(ctx: VisitorContext, root: any): Promise<Array<any>> {
    return []; // TODO: why is this part of visitor rather than rule?
  }

  public async visit(ctx: VisitorContext, root: any): Promise<VisitorContext> {
    for (const rule of this.rules) {
      const items = await rule.pick(ctx, root);
      let itemIndex = 0;
      for (const item of items) {
        ctx.visitData = {
          itemIndex,
          rule,
        };

        await this.visitItem(ctx, item, itemIndex, rule);
        itemIndex += 1;
      }
    }

    return ctx;
  }

  public async visitItem(ctx: VisitorContext, item: any, itemIndex: number, rule: Rule): Promise<void> {
    const itemResult = cloneDeep(item);
    const ruleResult = await rule.visit(ctx, itemResult);

    if (hasItems(ruleResult.errors)) {
      ctx.logger.warn({ count: ruleResult.errors.length, rule }, 'rule failed');
      ctx.mergeResult(ruleResult, ctx.visitData);
      return;
    }

    const itemDiff = diff(item, itemResult);
    if (hasItems(itemDiff)) {
      ctx.logger.info({
        diff: itemDiff,
        item,
        rule: rule.name,
      }, 'rule passed with modifications');

      if (ctx.schemaOptions.mutate) {
        applyDiff(item, itemResult);
      }
    } else {
      ctx.logger.info({ rule: rule.name }, 'rule passed');
    }
  }
}
