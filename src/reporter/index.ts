interface RuleResult {}

interface Reporter {
  report(results: Array<RuleResult>): Promise<void>;
}
