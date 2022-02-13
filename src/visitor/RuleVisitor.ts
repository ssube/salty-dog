import { hasItems } from '@apextoaster/js-utils';
import deepDiff from 'deep-diff';
import EventEmitter from 'events';
import lodash from 'lodash';

import { Rule, RuleResult } from '../rule/index.js';
import { Document, Element } from '../source.js';
import { Visitor } from './index.js';
import { VisitorContext } from './VisitorContext.js';

const { applyDiff, diff } = deepDiff;
/* eslint-disable-next-line @typescript-eslint/unbound-method */
const { cloneDeep } = lodash;

export interface RuleVisitorOptions {
  rules: ReadonlyArray<Rule>;
}

export class RuleVisitor extends EventEmitter implements RuleVisitorOptions, Visitor {
  public readonly rules: ReadonlyArray<Rule>;

  constructor(options: RuleVisitorOptions) {
    super();

    this.rules = Array.from(options.rules);
  }

  public async pick(ctx: VisitorContext, rule: Rule, root: Document): Promise<Array<Element>> {
    return rule.pick(ctx, root);
  }

  public async visit(ctx: VisitorContext, rule: Rule, elem: Element): Promise<RuleResult> {
    const results = {
      changes: [],
      errors: [],
    };

    const elemResult = cloneDeep(elem);
    const ruleResult = await rule.visit(ctx, elemResult);

    if (hasItems(ruleResult.errors)) {
      ctx.logger.warn({ count: ruleResult.errors.length, rule }, 'rule failed');
      ctx.mergeResult(ruleResult, elem);
      return results;
    }

    const itemDiff = diff(elem, elemResult);
    if (hasItems(itemDiff)) {
      ctx.logger.info({
        diff: itemDiff,
        item: elem,
        rule: rule.name,
      }, 'rule passed with modifications');

      if (ctx.schemaOptions.mutate) {
        applyDiff(elem, elemResult);
      }
    } else {
      ctx.logger.info({ rule: rule.name }, 'rule passed');
    }

    return results;
  }

  public async visitAll(ctx: VisitorContext, rule: Rule, doc: Document): Promise<Array<RuleResult>> {
    const elems = await this.pick(ctx, rule, doc);
    return Promise.all(elems.map((e) => this.visit(ctx, rule, e)));
  }
}
