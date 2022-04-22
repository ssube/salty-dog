import { expect } from 'chai';

import { ERROR_EMPTY_RESULT, TableReporter } from '../../src/reporter/TableReporter.js';
import { makeResults } from '../helpers.js';

describe('table reporter', () => {
  it('should handle empty results', async () => {
    const reporter = new TableReporter();
    const report = await reporter.report([]);
    expect(report).to.equal(ERROR_EMPTY_RESULT);
  });

  it('should group results by rule', async () => {
    const ruleNames = ['test', 'foo', 'bar'];
    const { results } = makeResults(ruleNames);

    const reporter = new TableReporter();
    const report = await reporter.report(results);

    for (const name of ruleNames) {
      expect(report).to.include(` ${name} `); // wrap with margin to avoid partial words
    }
  });

  it('should print results in a table', async () => {
    const ruleNames = ['test', 'foo', 'bar'];
    const { results } = makeResults(ruleNames);

    const reporter = new TableReporter();
    const report = await reporter.report(results);

    for (const line of report.split('\n')) {
      expect(line).to.match(/^|/);
    }
  });
});

describe('print table helper', () => {
  it('should include column names in the first row');
  it('should have a second row with delimiters');
  it('should show data starting from the third row');
  it('should pad and right-align short fields');
});
