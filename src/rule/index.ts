import { ValidateFunction } from 'ajv';
import { applyDiff, diff } from 'deep-diff';
import { cloneDeep, Dictionary, intersection, isNil } from 'lodash';
import { LogLevel } from 'noicejs';
import { join } from 'path';

import { YamlParser } from '../parser/YamlParser';
import { readDir, readFile } from '../source';
import { ensureArray, hasItems } from '../utils';
import { VisitorResult } from '../visitor';
import { VisitorContext } from '../visitor/VisitorContext';
import { SchemaRule } from './SchemaRule';

/* eslint-disable @typescript-eslint/no-explicit-any */
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
/* tslint:enable:no-any */

export type Validator = ValidateFunction;
export interface Rule {
  check: Validator;
  desc?: string;
  filter?: Validator;
  level: LogLevel;
  name: string;
  select: string;
  tags: Array<string>;

  pick(ctx: VisitorContext, root: any): Promise<Array<any>>;
  visit(ctx: VisitorContext, item: any): Promise<VisitorResult>;
}

/**
 * Rule selector derived from arguments.
 *
 * The `excludeFoo`/`includeFoo`/ names match yargs output structure.
 */
export interface RuleSelector {
  excludeLevel: Array<LogLevel>;
  excludeName: Array<string>;
  excludeTag: Array<string>;
  includeLevel: Array<LogLevel>;
  includeName: Array<string>;
  includeTag: Array<string>;
}

/**
 * Rule sources derived from arguments.
 *
 * The `ruleFoo` names match yargs output structure.
 */
export interface RuleSources {
  ruleFile: Array<string>;
  ruleModule: Array<string>;
  rulePath: Array<string>;
}

export interface RuleSourceData {
  definitions?: Dictionary<any>;
  name: string;
  rules: Array<RuleData>;
}

export interface RuleSourceModule {
  definitions?: Dictionary<any>;
  name: string;
  rules: Array<Rule>;
}

export function createRuleSelector(options: Partial<RuleSelector>): RuleSelector {
  return {
    excludeLevel: ensureArray(options.excludeLevel),
    excludeName: ensureArray(options.excludeName),
    excludeTag: ensureArray(options.excludeTag),
    includeLevel: ensureArray(options.includeLevel),
    includeName: ensureArray(options.includeName),
    includeTag: ensureArray(options.includeTag),
  };
}

export function createRuleSources(options: Partial<RuleSources>): RuleSources {
  return {
    ruleFile: ensureArray(options.ruleFile),
    ruleModule: ensureArray(options.ruleModule),
    rulePath: ensureArray(options.rulePath),
  };
}

export async function loadRuleFiles(paths: Array<string>, ctx: VisitorContext): Promise<Array<Rule>> {
  const parser = new YamlParser();
  const rules = [];

  for (const path of paths) {
    const contents = await readFile(path, {
      encoding: 'utf-8',
    });

    const docs = parser.parse(contents) as Array<RuleSourceData>;

    for (const data of docs) {
      if (!isNil(data.definitions)) {
        ctx.addSchema(data.name, data.definitions);
      }

      rules.push(...data.rules.map((it: RuleData) => new SchemaRule(it)));
    }
  }

  return rules;
}

export async function loadRulePaths(paths: Array<string>, ctx: VisitorContext): Promise<Array<Rule>> {
  const rules = [];

  for (const path of paths) {
    const allFiles = await readDir(path);
    // skip files that start with `.`, limit to json and yaml/yml
    const files = allFiles
      .filter((name) => name.toLowerCase().match(/^[^\.].*\.(json|ya?ml)/))
      .map((name) => join(path, name));

    const pathRules = await loadRuleFiles(files, ctx);
    rules.push(...pathRules);
  }

  return rules;
}

export async function loadRuleModules(modules: Array<string>, ctx: VisitorContext): Promise<Array<Rule>> {
  const rules = [];

  for (const name of modules) {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const module: RuleSourceModule = require(name);
      // TODO: ensure module has definitions, name, and rules

      if (!isNil(module.definitions)) {
        ctx.addSchema(module.name, module.definitions);
      }

      rules.push(...module.rules);
    } catch (err) {
      ctx.logger.error(err, 'error requiring rule module');
    }
  }

  return rules;
}

export async function loadRules(sources: RuleSources, ctx: VisitorContext): Promise<Array<Rule>> {
  return [
    ...await loadRuleFiles(sources.ruleFile, ctx),
    ...await loadRulePaths(sources.rulePath, ctx),
    ...await loadRuleModules(sources.ruleModule, ctx),
  ];
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
      const itemResult = cloneDeep(item);
      const ruleResult = await rule.visit(ctx, itemResult);

      if (hasItems(ruleResult.errors)) {
        ctx.logger.warn({ count: ruleResult.errors.length, rule }, 'rule failed');
        ctx.mergeResult(ruleResult);
        continue;
      }

      const itemDiff = diff(item, itemResult);
      if (hasItems(itemDiff)) {
        ctx.logger.info({
          diff: itemDiff,
          item,
          rule: rule.name,
        }, 'rule passed with modifications');

        if (ctx.innerOptions.mutate) {
          applyDiff(item, itemResult);
        }
      } else {
        ctx.logger.info({ rule: rule.name }, 'rule passed');
      }
    }
  }

  return ctx;
}
