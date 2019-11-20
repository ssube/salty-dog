import { applyDiff, diff } from 'deep-diff';
import { EventEmitter } from 'events';
import { cloneDeep } from 'lodash';

import { Rule } from '.';
import { hasItems } from '../utils';
import { Visitor, VisitorResult } from '../visitor';
import { VisitorContext } from '../visitor/VisitorContext';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RuleVisitorData {
  item: unknown;
  itemIndex: number;
  rule: Rule;
  ruleIndex: number;
}

export interface RuleVisitorError extends RuleVisitorData {
  key: string;
  path: string;
}

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

export type RuleVisitorContext = VisitorContext<RuleVisitorData, RuleVisitorError>;
export type RuleVisitorResult = VisitorResult<RuleVisitorError>;

export class RuleVisitor extends EventEmitter implements RuleVisitorOptions, Visitor<RuleVisitorData, RuleVisitorError> {
  public readonly rules: ReadonlyArray<Rule>;

  constructor(options: RuleVisitorOptions) {
    super();

    this.rules = Array.from(options.rules);
  }

  public async pick(ctx: RuleVisitorContext, root: any): Promise<Array<any>> {
    return []; // TODO: why is this part of visitor rather than rule?
  }

  public async visit(ctx: RuleVisitorContext, root: any): Promise<RuleVisitorResult> {
    let ruleIndex = 0;
    for (const rule of this.rules) {
      this.emit(RuleVisitorEvents.RULE_VISIT, {
        rule,
      });

      let ruleErrors = 0;

      const items = await rule.pick(ctx, root);
      let itemIndex = 0;
      for (const item of items) {
        ctx.visitData = {
          item,
          itemIndex,
          rule,
          ruleIndex,
        };

        const result = await this.visitItem(ctx, item, itemIndex, rule);
        ctx.mergeResult(result);

        ruleErrors += result.errors.length;
        itemIndex += 1;
      }

      if (ruleErrors > 0) {
        ctx.logger.warn({ rule: rule.name }, 'rule failed');
        this.emit(RuleVisitorEvents.RULE_ERROR, {
          rule,
        });
      } else {
        ctx.logger.info({ rule: rule.name }, 'rule passed');
        this.emit(RuleVisitorEvents.RULE_PASS, {
          rule,
        });
      }

      ruleIndex += 1;
    }

    return ctx;
  }

  public async visitItem(ctx: RuleVisitorContext, item: any, itemIndex: number, rule: Rule): Promise<RuleVisitorResult> {
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

      return ruleResult;
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

    return ruleResult;
  }
}
