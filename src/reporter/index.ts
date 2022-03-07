import { RuleResult } from '../rule';

export interface Reporter {
  report(results: ReadonlyArray<RuleResult>): Promise<string>;
}
