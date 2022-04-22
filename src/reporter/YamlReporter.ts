import { Reporter } from './index.js';
import { RuleResult } from '../rule/index.js';
import { YamlParser } from '../parser/YamlParser.js';

export class YamlReporter implements Reporter {
  public async report(results: Array<RuleResult>): Promise<string> {
    const parser = new YamlParser();
    const data = {
      changes: results.flatMap((r) => r.changes).map((c) => c.rule.name),
      errors: results.flatMap((r) => r.errors).map((e) => e.rule.name),
    };
    return parser.dump({
      data,
      source: {
        data: '',
        path: '',
      },
    });
  }
}
