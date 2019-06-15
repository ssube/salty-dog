import * as ajv from 'ajv';
import { readFile } from 'fs';
import { intersection } from 'lodash';
import { LogLevel } from 'noicejs';
import { promisify } from 'util';
import { safeLoad } from 'js-yaml';
import { CONFIG_SCHEMA } from './config';

const readFileSync = promisify(readFile);

export interface Rule {
  level: LogLevel;
  name: string;
  nodes: {
    filter: string;
    select: string;
  };
  schema: any;
  tags: Array<string>;
}

export interface RuleSelector {
  excludeLevel: Array<LogLevel>;
  excludeName: Array<string>;
  excludeTag: Array<string>;
  includeLevel: Array<LogLevel>;
  includeName: Array<string>;
  includeTag: Array<string>;
}

export async function loadRules(paths: Array<string>): Promise<Array<Rule>> {
  const rules = [];

  for (const path of paths) {
    const contents = await readFileSync(path, {
      encoding: 'utf-8',
    });

    const data = safeLoad(contents, {
      schema: CONFIG_SCHEMA,
    });

    rules.push(...data.rules);
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

export function checkRule(rule: Rule, data: any): boolean {
  const schema = new ((ajv as any).default)().compile(rule.schema);
  const valid = schema(data);
  console.log(data, valid);
  return !!valid;
}