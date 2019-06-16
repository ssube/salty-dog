import * as Ajv from 'ajv';
import { readFile } from 'fs';
import { safeLoad } from 'js-yaml';
import { JSONPath } from 'jsonpath-plus';
import { intersection, isNil } from 'lodash';
import { Logger, LogLevel } from 'noicejs';
import { promisify } from 'util';

import { CONFIG_SCHEMA } from './config';

const readFileSync = promisify(readFile);

export interface Rule {
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

export function checkRule(rule: Rule, data: any, logger: Logger): boolean {
  const ajv = new ((Ajv as any).default)()
  const check = ajv.compile(rule.check);
  const filter = compileFilter(rule, ajv);
  const scopes = JSONPath({
    json: data,
    path: rule.select,
  });

  if (isNil(scopes) || scopes.length === 0) {
    logger.debug('no data selected');
    return true;
  }

  for (const item of scopes) {
    logger.debug({ item }, 'filtering item');
    if (filter(item)) {
      logger.debug({ item }, 'checking item')
      if (!check(item)) {
        logger.warn({
          desc: rule.desc,
          errors: check.errors,
          item,
        }, 'rule failed on item');
        return false;
      }
    } else {
      logger.debug({ errors: filter.errors, item }, 'skipping item');
    }
  }

  return true;
}

export function compileFilter(rule: Rule, ajv: any): any {
  if (isNil(rule.filter)) {
    return () => true;
  } else {
    return ajv.compile(rule.filter);
  }
}