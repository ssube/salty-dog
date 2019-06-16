import * as Ajv from 'ajv';
import { JSONPath } from 'jsonpath-plus';
import { cloneDeep, intersection, isNil } from 'lodash';
import { LogLevel } from 'noicejs';

import { YamlParser } from 'src/parser/YamlParser';
import { readFileSync } from 'src/source';
import { Visitor } from 'src/visitor';
import { VisitorContext } from 'src/visitor/context';

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

export async function loadRules(paths: Array<string>): Promise<Array<Rule>> {
  const parser = new YamlParser();
  const rules = [];

  for (const path of paths) {
    const contents = await readFileSync(path, {
      encoding: 'utf-8',
    });

    const data = parser.parse(contents);
    rules.push(...data.rules.map((data: any) => new Rule(data)));
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

export class Rule implements RuleData, Visitor {
  public readonly check: any;
  public readonly desc: string;
  public readonly filter?: any;
  public readonly level: LogLevel;
  public readonly name: string;
  public readonly select: string;
  public readonly tags: string[];

  constructor(data: RuleData) {
    this.desc = data.desc;
    this.level = data.level;
    this.name = data.name;
    this.select = data.select;
    this.tags = Array.from(data.tags);

    // copy schema objects
    this.check = cloneDeep(data.check);
    if (!isNil(data.filter)) {
      this.filter = cloneDeep(data.filter);
    }
  }

  public async visit(ctx: VisitorContext, node: any): Promise<VisitorContext> {
    const ajv = new ((Ajv as any).default)()
    const check = ajv.compile(this.check);
    const filter = this.compileFilter(ajv);
    const scopes = JSONPath({
      json: node,
      path: this.select,
    });

    if (isNil(scopes) || scopes.length === 0) {
      ctx.logger.debug('no data selected');
      return ctx;
    }

    for (const item of scopes) {
      ctx.logger.debug({ item }, 'filtering item');
      if (filter(item)) {
        ctx.logger.debug({ item }, 'checking item')
        if (!check(item)) {
          ctx.logger.warn({
            desc: this.desc,
            errors: check.errors,
            item,
          }, 'rule failed on item');
          ctx.errors.push(...check.errors);
          return ctx;
        }
      } else {
        ctx.logger.debug({ errors: filter.errors, item }, 'skipping item');
      }
    }

    return ctx;
  }

  protected compileFilter(ajv: any): any {
    if (isNil(this.filter)) {
      return () => true;
    } else {
      return ajv.compile(this.filter);
    }
  }
}