import { applyDiff, diff } from 'deep-diff';
import { EventEmitter } from 'events';
import { cloneDeep } from 'lodash';

import { Rule } from '.';
import { hasItems } from '../utils';
import { Visitor } from '../visitor';
import { VisitorContext } from '../visitor/VisitorContext';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RuleVisitorOptions {
  rules: ReadonlyArray<Rule>;
}

export enum RuleVisitorEvents {
  ITEM_DIFF = 'item-diff',
  ITEM_ERROR = 'item-error',
  ITEM_PASS = 'item-pass',
  ITEM_VISIT = 'item-visit',
  RULE_ERROR = 'rule-error',
  RULE_PASS = 'rule-pass',
  RULE_VISIT = 'rule-visit',
}

export class RuleVisitor extends EventEmitter implements RuleVisitorOptions, Visitor {
  public readonly rules: ReadonlyArray<Rule>;

  constructor(options: RuleVisitorOptions) {
    super();

    this.rules = Array.from(options.rules);
  }

  public async pick(ctx: VisitorContext, root: any): Promise<Array<any>> {
    return []; // TODO: why is this part of visitor rather than rule?
  }

  public async visit(ctx: VisitorContext, root: any): Promise<VisitorContext> {
    for (const rule of this.rules) {
      this.emit(RuleVisitorEvents.RULE_VISIT, {
        rule,
      });

      const errorsBefore = ctx.errors.length;

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

      if (ctx.errors.length > errorsBefore) {
        ctx.logger.info({ rule: rule.name }, 'rule failed');
        this.emit(RuleVisitorEvents.RULE_ERROR, {
          rule,
        });
      } else {
        ctx.logger.info({ rule: rule.name }, 'rule passed');
        this.emit(RuleVisitorEvents.RULE_PASS, {
          rule,
        });
      }
    }

    return ctx;
  }

  public async visitItem(ctx: VisitorContext, item: any, itemIndex: number, rule: Rule): Promise<VisitorContext> {
    const itemResult = cloneDeep(item);
    const ruleResult = await rule.visit(ctx, itemResult);

    if (hasItems(ruleResult.errors)) {
      const errorData = {
        count: ruleResult.errors.length,
        item,
        rule,
      };
      ctx.logger.warn(errorData, 'item failed');
      this.emit(RuleVisitorEvents.ITEM_ERROR, errorData);

      ctx.mergeResult(ruleResult, ctx.visitData);
      return ctx;
    }

    const itemDiff = diff(item, itemResult);
    if (hasItems(itemDiff)) {
      const diffData = {
        diff: itemDiff,
        item,
        rule,
      };
      ctx.logger.info(diffData, 'item could pass rule with changes');
      this.emit(RuleVisitorEvents.ITEM_DIFF, diffData);

      if (ctx.schemaOptions.mutate) {
        applyDiff(item, itemResult);
      }
    }

    const passData = {
      item,
      rule,
    };
    ctx.logger.debug(passData, 'item passed');
    this.emit(RuleVisitorEvents.ITEM_PASS, passData);

    return ctx;
  }
}
