import { ValidateFunction } from 'ajv';
import { applyDiff, diff } from 'deep-diff';
import { JSONPath } from 'jsonpath-plus';
import { cloneDeep, defaultTo, Dictionary, intersection, isNil } from 'lodash';
import { LogLevel } from 'noicejs';

import { YamlParser } from './parser/YamlParser';
import { readFileSync } from './source';
import { ensureArray, hasItems } from './utils';
import { friendlyError } from './utils/ajv';
import { Visitor } from './visitor';
import { VisitorContext } from './visitor/VisitorContext';
import { VisitorError } from './visitor/VisitorError';
import { VisitorResult } from './visitor/VisitorResult';

/* tslint:disable:no-any */

export interface RuleData {
  // metadata
  desc: string;
  level: LogLevel;
  name: string;
  tags: Array<string>;
  // data
  check: any;
  filter?: any;
  select: string;
}

export interface RuleSelector {
  excludeLevel: Array<LogLevel>;
  excludeName: Array<string>;
  excludeTag: Array<string>;
  includeLevel: Array<LogLevel>;
  includeName: Array<string>;
  includeTag: Array<string>;
}

export interface RuleSource {
  definitions?: Dictionary<any>;
  name: string;
  rules: Array<RuleData>;
}

export interface RuleResult extends VisitorResult {
  rule: Rule;
}

export class Rule implements RuleData, Visitor<RuleResult> {
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

    if (isNil(scopes) || scopes.length === 0) {
      ctx.logger.debug('no data selected');
      return [];
    }

    return scopes;
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
      if (!check(node) && !isNil(check.errors) && check.errors.length > 0) {
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

export function makeSelector(options: Partial<RuleSelector>) {
  return {
    excludeLevel: ensureArray(options.excludeLevel),
    excludeName: ensureArray(options.excludeName),
    excludeTag: ensureArray(options.excludeTag),
    includeLevel: ensureArray(options.includeLevel),
    includeName: ensureArray(options.includeName),
    includeTag: ensureArray(options.includeTag),
  };
}

export async function loadRules(paths: Array<string>, ctx: VisitorContext): Promise<Array<Rule>> {
  const parser = new YamlParser();
  const rules = [];

  for (const path of paths) {
    const contents = await readFileSync(path, {
      encoding: 'utf-8',
    });

    const docs = parser.parse(contents) as Array<RuleSource>;

    for (const data of docs) {
      if (!isNil(data.definitions)) {
        ctx.addSchema(data.name, data.definitions);
      }

      rules.push(...data.rules.map((it: RuleData) => new Rule(it)));
    }
  }

  return rules;
}

export async function resolveRules(rules: Array<Rule>, selector: RuleSelector): Promise<Array<Rule>> {
  const activeRules = new Set<Rule>();

  for (const r of rules) {
    if (selector.excludeLevel.includes(r.level)) {
      continue;
    }

    if (selector.excludeName.includes(r.name)) {
      continue;
    }

    const excludedTags = intersection(selector.excludeTag, r.tags);
    if (excludedTags.length > 0) {
      continue;
    }

    if (selector.includeLevel.includes(r.level)) {
      activeRules.add(r);
    }

    if (selector.includeName.includes(r.name)) {
      activeRules.add(r);
    }

    const includedTags = intersection(selector.includeTag, r.tags);
    if (includedTags.length > 0) {
      activeRules.add(r);
    }
  }

  return Array.from(activeRules);
}

export async function visitRules(ctx: VisitorContext, rules: Array<Rule>, data: any): Promise<VisitorContext> {
  for (const rule of rules) {
    const items = await rule.pick(ctx, data);
    for (const item of items) {
      const itemCopy = cloneDeep(item);
      const itemResult = await rule.visit(ctx, itemCopy);

      if (itemResult.errors.length > 0) {
        ctx.logger.warn({ count: itemResult.errors.length, rule }, 'rule failed');
        ctx.mergeResult(itemResult);
        continue;
      }

      const itemDiff = diff(item, itemCopy);
      if (hasItems(itemDiff)) {
        ctx.logger.info({
          diff: itemDiff,
          item,
          rule: rule.name,
        }, 'rule passed with modifications');

        if (ctx.innerOptions.mutate) {
          applyDiff(item, itemCopy);
        }
      } else {
        ctx.logger.info({ rule: rule.name }, 'rule passed');
      }
   }
  }

  return ctx;
}
