import { doesExist, ensureArray } from '@apextoaster/js-utils';
import minimatch from 'minimatch';

import { isPOJSO, Rule, RuleData } from '.';
import { YamlParser } from '../parser/YamlParser';
import { listFiles, readSource } from '../source';
import { VisitorContext } from '../visitor/VisitorContext';
import { SchemaRule } from './SchemaRule';
import { validateRules } from './validate';

const { Minimatch } = minimatch;

export function createRuleSources(options: Partial<RuleSources>): RuleSources {
  return {
    ruleFile: ensureArray(options.ruleFile),
    ruleModule: ensureArray(options.ruleModule),
    rulePath: ensureArray(options.rulePath),
  };
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
  definitions?: Record<string, unknown>;
  name: string;
  rules: Array<RuleData>;
}

export interface RuleSourceModule {
  definitions?: Record<string, unknown>;
  name: string;
  rules: Array<Rule | RuleData>;
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
    const source = {
      data: contents,
      path,
    };

    const docs = parser.parse(source);

    for (const doc of docs) {
      const data = doc.data as RuleSourceData;
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

export async function importRuleModule(path: string, load?: LoadBack) {
  if (doesExist(load)) {
    return load(path);
  } else {
    return import(path);
  }
}

export async function loadRuleModules(modules: Array<string>, ctx: VisitorContext, load?: LoadBack): Promise<Array<Rule>> {
  const rules = [];

  for (const name of modules) {
    try {
      const data: RuleSourceModule = await importRuleModule(name, load);
      if (!validateRules(ctx, data)) {
        ctx.logger.error({
          module: name,
        }, 'error loading rule module');
        continue;
      }

      rules.push(...await loadRuleSource(data, ctx));
    } catch (err) {
      if (err instanceof Error) {
        ctx.logger.error(err, 'error loading rule module');
      } else {
        ctx.logger.error({ err }, 'unknown error type loading rule module');
      }
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
