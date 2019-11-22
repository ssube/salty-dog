import { applyDiff, Diff, diff } from 'deep-diff';
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
      const ruleData = {
        rule,
      };
      this.emit(RuleVisitorEvents.RULE_VISIT, ruleData);

      let itemIndex = 0;
      let ruleErrors = 0;
      const items = await rule.pick(ctx, root);
      for (const item of items) {
        const result = await this.visitItem(ctx, {
          item,
          itemIndex,
          rule,
          ruleIndex,
        });
        ctx.mergeResult(result);

        ruleErrors += result.errors.length;
        itemIndex += 1;
      }

      if (ruleErrors > 0) {
        ctx.logger.warn({ rule: rule.name }, 'rule failed');
        this.emit(RuleVisitorEvents.RULE_ERROR, ruleData);
      } else {
        ctx.logger.info({ rule: rule.name }, 'rule passed');
        this.emit(RuleVisitorEvents.RULE_PASS, ruleData);
      }

      ruleIndex += 1;
    }

    return ctx;
  }

  public async visitItem(ctx: RuleVisitorContext, data: RuleVisitorData): Promise<RuleVisitorResult> {
    ctx.visitData = data;

    const itemResult = cloneDeep(data.item);
    const ruleResult = await data.rule.visit(ctx, itemResult);

    if (hasItems(ruleResult.errors)) {
      const errorData = {
        ...data,
        count: ruleResult.errors.length,
      };
      ctx.logger.warn(errorData, 'item failed');
      this.emit(RuleVisitorEvents.ITEM_ERROR, errorData);

      return ruleResult;
    }

    const itemDiff = diff(data.item, itemResult);
    if (hasItems(itemDiff)) {
      await this.visitDiff(ctx, data, itemDiff, itemResult);
    }

    ctx.logger.debug(data, 'item passed');
    this.emit(RuleVisitorEvents.ITEM_PASS, data);

    return ruleResult;
  }

  public async visitDiff(ctx: RuleVisitorContext, data: RuleVisitorData, itemDiff: Array<Diff<any, any>>, result: any): Promise<void> {
    const diffData = {
      ...data,
      diff: itemDiff,
    };
    ctx.logger.info(diffData, 'item could pass rule with changes');
    this.emit(RuleVisitorEvents.ITEM_DIFF, diffData);

    if (ctx.schemaOptions.mutate) {
      applyDiff(data.item, result);
    }
  }
}
