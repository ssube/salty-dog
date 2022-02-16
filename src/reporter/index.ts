import { RuleResult } from '../rule';

export interface Reporter {
  report(results: Array<RuleResult>): Promise<string>;
}
