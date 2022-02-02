import { doesExist, ensureArray } from '@apextoaster/js-utils';
import { ValidateFunction } from 'ajv';
import lodash from 'lodash';
const { intersection } = lodash;
import minimatch from 'minimatch';
const { Minimatch } = minimatch;
import { LogLevel } from 'noicejs';

// import ruleSchemaData from '../../rules/salty-dog.yml';
import { YamlParser } from '../parser/YamlParser.js';
import { listFiles, readSource } from '../source.js';
import { VisitorResult } from '../visitor/index.js';
import { VisitorContext } from '../visitor/VisitorContext.js';
import { SchemaRule } from './SchemaRule.js';

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
  definitions?: Record<string, any>;
  name: string;
  rules: Array<RuleData>;
}

export interface RuleSourceModule {
  definitions?: Record<string, any>;
  name: string;
  rules: Array<Rule | RuleData>;
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

export function isPOJSO(val: any): val is RuleData {
  return Reflect.getPrototypeOf(val) === Reflect.getPrototypeOf({});
}

export async function loadRuleSource(data: RuleSourceModule, ctx: VisitorContext): Promise<Array<Rule>> {
  if (doesExist(data.definitions)) {
    ctx.addSchema(data.name, data.definitions);
  }

  return data.rules.map((it: Rule | RuleData) => {
    if (isPOJSO(it)) {
      return new SchemaRule(it);
    } else {
      return it;
    }
  });
}

export async function loadRuleFiles(paths: Array<string>, ctx: VisitorContext): Promise<Array<Rule>> {
  const parser = new YamlParser();
  const rules = [];

  for (const path of paths) {
    const contents = await readSource(path);

    const docs = parser.parse(contents) as Array<RuleSourceData>;

    for (const data of docs) {
      if (!validateRules(ctx, data)) {
        ctx.logger.error({
          file: data,
          path,
        }, 'error loading rule file');
        continue;
      }

      rules.push(...await loadRuleSource(data, ctx));
    }
  }

  return rules;
}

export async function loadRulePaths(paths: Array<string>, ctx: VisitorContext): Promise<Array<Rule>> {
  const match = new Minimatch('**/*.+(json|yaml|yml)', {
    nocase: true,
  });
  const rules = [];

  for (const path of paths) {
    const allFiles = await listFiles(path);
    // skip files that start with `.`, limit to json and yaml/yml
    const files = allFiles
      .filter((name) => name[0] !== '.')
      .filter((name) => match.match(name));

    ctx.logger.debug({ files }, 'path matched rule files');

    const pathRules = await loadRuleFiles(files, ctx);
    rules.push(...pathRules);
  }

  return rules;
}

type LoadBack = (path: string) => Promise<unknown>;

export async function loadRuleModules(modules: Array<string>, ctx: VisitorContext, load?: LoadBack): Promise<Array<Rule>> {
  const rules = [];

  function loadModule(path: string) {
    if (doesExist(load)) {
      return load(path);
    } else {
      return import(path);
    }
  }

  for (const name of modules) {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const data: RuleSourceModule = await loadModule(name);
      if (!validateRules(ctx, data)) {
        ctx.logger.error({
          module: name,
        }, 'error loading rule module');
        continue;
      }

      rules.push(...await loadRuleSource(data, ctx));
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
    let active = false;

    const includedTags = intersection(selector.includeTag, r.tags);
    active = active || selector.includeLevel.includes(r.level);
    active = active || selector.includeName.includes(r.name);
    active = active || includedTags.length > 0;

    active = active && !selector.excludeLevel.includes(r.level);
    active = active && !selector.excludeName.includes(r.name);
    const excludedTags = intersection(selector.excludeTag, r.tags);
    active = active && (excludedTags.length === 0);

    if (active) {
      activeRules.add(r);
    }
  }

  return Array.from(activeRules);
}

export function validateRules(ctx: VisitorContext, root: any): boolean {
  const { definitions, name } = { definitions: { config: {} } } as any; // ruleSchemaData as any;

  const validCtx = new VisitorContext(ctx);
  validCtx.addSchema(name, definitions);
  const ruleSchema = validCtx.compile(definitions.source);

  if (ruleSchema(root) === true) {
    return true;
  } else {
    ctx.logger.error({ errors: ruleSchema.errors }, 'error validating rules');
    return false;
  }
}

export function validateConfig(ctx: VisitorContext, root: any): boolean {
  const { definitions, name } = { definitions: { config: {} } } as any; // ruleSchemaData as any;

  const validCtx = new VisitorContext(ctx);
  validCtx.addSchema(name, definitions);
  const ruleSchema = validCtx.compile(definitions.config);

  if (ruleSchema(root) === true) {
    return true;
  } else {
    ctx.logger.error({ errors: ruleSchema.errors }, 'error validating rules');
    return false;
  }
}
