/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import { LogLevel } from 'noicejs';

import { YamlReporter } from '../../src/reporter/YamlReporter.js';
import { RuleResult } from '../../src/rule/index.js';
import { makeElement, makeResults } from '../helpers.js';

describe('yaml reporter', () => {
  it('should handle empty results', async () => {
    const reporter = new YamlReporter();
    const report = await reporter.report([]);
    expect(report).to.equal('changes: []\nerrors: []\n');
  });

  it('should collect results by type', async () => {
    const ruleNames = ['test', 'foo', 'bar'];
    const { rules } = makeResults(ruleNames, [], [{
      data: makeElement({}),
      err: {} as any,
      level: LogLevel.Debug,
      msg: '',
      rule: {
        name: 'test',
      } as any,
    }]);
    const results: Array<RuleResult> = rules.map((rule) => ({
      changes: [],
      errors: [{
        data: makeElement({}),
        err: {} as any,
        level: LogLevel.Debug,
        msg: '',
        rule,
      }],
      rule,
    }));

    const reporter = new YamlReporter();
    const report = await reporter.report(results);

    for (const name of ruleNames) {
      expect(report).to.include(`- ${name}\n`); // wrap with margin to avoid partial words
    }
  });
});
