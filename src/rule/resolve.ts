import { toArray } from '@apextoaster/js-utils';
import lodash from 'lodash';
import { LogLevel } from 'noicejs';
import { Rule } from '.';

/* eslint-disable-next-line @typescript-eslint/unbound-method */
const { intersection } = lodash;

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

export function createRuleSelector(options: Partial<RuleSelector>): RuleSelector {
  return {
    excludeLevel: toArray(options.excludeLevel),
    excludeName: toArray(options.excludeName),
    excludeTag: toArray(options.excludeTag),
    includeLevel: toArray(options.includeLevel),
    includeName: toArray(options.includeName),
    includeTag: toArray(options.includeTag),
  };
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
