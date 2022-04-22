import { expect } from 'chai';
import { LogLevel } from 'noicejs';

import { ERROR_EMPTY_RESULT, SummaryReporter } from '../../src/reporter/SummaryReporter.js';
import { RuleResult } from '../../src/rule/index.js';
import { makeElement, makeResults } from '../helpers.js';

describe('summary reporter', () => {
  it('should handle empty results', async () => {
    const reporter = new SummaryReporter();
    const report = await reporter.report([]);
    expect(report).to.equal(ERROR_EMPTY_RESULT);
  });

  it('should count results by type', async () => {
    const ruleNames = ['test', 'foo', 'bar'];
    const { rules } = makeResults(ruleNames);
    const results: Array<RuleResult> = rules.map((rule) => ({
      changes: [],
      errors: [{
        data: makeElement({}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        err: {} as any,
        level: LogLevel.Debug,
        msg: '',
        rule,
      }],
      rule,
    }));

    const reporter = new SummaryReporter();
    const report = await reporter.report(results);

    for (const name of ruleNames) {
      expect(report).to.include(`${name}: 1`); // wrap with margin to avoid partial words
    }
  });
});
