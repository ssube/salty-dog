import { RuleResult } from '../rule';

export interface Reporter {
  report(results: Array<RuleResult>): Promise<void>;
}

class SummaryReporter { }
class TableReporter { }
class YamlReporter { }
