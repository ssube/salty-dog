import { setOrPush } from '@apextoaster/js-utils';

import { Rule, RuleError, RuleResult } from '../rule/index.js';
import { Reporter } from './index.js';

export const ERROR_EMPTY_RESULT = 'no errors to report';

export class SummaryReporter implements Reporter {
  public async report(results: Array<RuleResult>): Promise<string> {
    const ruleErrors = new Map<Rule, Array<RuleError>>();

    for (const result of results) {
      for (const err of result.errors) {
        setOrPush(ruleErrors, err.rule, err);
      }
    }

    if (ruleErrors.size === 0) {
      return ERROR_EMPTY_RESULT;
    }

    const summary = ['rule errors'];
    for (const [rule, errors] of ruleErrors) {
      summary.push(`${rule.name}: ${errors.length}`);
    }

    return summary.join('\n');
  }
}
