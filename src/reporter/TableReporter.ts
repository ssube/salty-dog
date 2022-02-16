import { Reporter } from './index.js';
import { RuleResult } from '../rule/index.js';

export class TableReporter implements Reporter {
  public async report(results: Array<RuleResult>): Promise<string> {
    const errors = results.reduce((p, c) => p + c.errors.length, 0);

    return `${errors} errors in run`;
  }
}
