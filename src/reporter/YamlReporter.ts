import { Reporter } from './index.js';
import { RuleResult } from '../rule/index.js';

export class YamlReporter implements Reporter {
  public report(results: Array<RuleResult>): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
