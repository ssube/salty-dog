import { setOrPush } from '@apextoaster/js-utils';

import { Rule, RuleError, RuleResult } from '../rule/index.js';
import { Reporter } from './index.js';

export class TableReporter implements Reporter {
  public async report(results: Array<RuleResult>): Promise<string> {
    const ruleErrors = new Map<Rule, Array<RuleError>>();

    for (const err of results.flatMap((r) => r.errors)) {
      setOrPush(ruleErrors, err.rule, err);
    }

    if (ruleErrors.size === 0) {
      return 'no errors to report';
    }

    const summary = [];
    for (const [rule, errors] of ruleErrors) {
      summary.push(`${rule.name}: ${errors.length}`);
    }

    return summary.join('\n');
  }
}
