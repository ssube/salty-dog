import { mustDefault, mustGet } from '@apextoaster/js-utils';
import { createLogger } from 'bunyan';
import yargs from 'yargs';

import { CONFIG_ARGS_NAME, CONFIG_ARGS_PATH, MODE, parseArgs } from './config/args.js';
import { loadConfig } from './config/index.js';
import { YamlParser } from './parser/YamlParser.js';
import { Reporter } from './reporter/index.js';
import { SummaryReporter } from './reporter/SummaryReporter.js';
import { TableReporter } from './reporter/TableReporter.js';
import { YamlReporter } from './reporter/YamlReporter.js';
import { createRuleSources, loadRules } from './rule/load.js';
import { createRuleSelector, resolveRules } from './rule/resolve.js';
import { validateConfig } from './rule/validate.js';
import { readSource, writeSource } from './source.js';
import { VERSION_INFO } from './version.js';
import { RuleVisitor } from './visitor/RuleVisitor.js';
import { VisitorContext } from './visitor/VisitorContext.js';

// re-exports
export { YamlParser } from './parser/YamlParser.js';
export { SummaryReporter } from './reporter/SummaryReporter.js';
export { TableReporter } from './reporter/TableReporter.js';
export { YamlReporter } from './reporter/YamlReporter.js';
export { createRuleSources, loadRules } from './rule/load.js';
export { createRuleSelector, resolveRules } from './rule/resolve.js';
export { validateConfig } from './rule/validate.js';
export { readSource, writeSource } from './source.js';
export { VERSION_INFO } from './version.js';
export { RuleVisitor } from './visitor/RuleVisitor.js';
export { VisitorContext } from './visitor/VisitorContext.js';

const ARGS_START = 2;
export const STATUS_SUCCESS = 0;
export const STATUS_ERROR = 1;
export const STATUS_MAX = 255;

export const REPORTERS = new Map<string, new () => Reporter>([
  ['summary', SummaryReporter],
  ['table', TableReporter],
  ['yaml', YamlReporter],
]);

export async function main(argv: Array<string>): Promise<number> {
  const { args, mode } = await parseArgs(argv.slice(ARGS_START));
  if (mode === MODE.complete) {
    yargs(argv).showCompletionScript();
    return STATUS_SUCCESS;
  }

  const config = await loadConfig(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args, mode }, 'main arguments');

  // load rules
  const ctx = new VisitorContext({
    logger,
    schemaOptions: {
      coerce: mustDefault(args.coerce, false),
      defaults: mustDefault(args.defaults, true),
      mutate:  mustDefault(args.mutate, true),
    },
  });

  if (!validateConfig(ctx, config)) {
    logger.error('config was not valid according to embedded schema');
    return STATUS_ERROR;
  }

  const ruleSelector = createRuleSelector(args);
  const ruleSources = createRuleSources(args);

  const loadedRules = await loadRules(ruleSources, ctx);
  const activeRules = await resolveRules(loadedRules, ruleSelector);

  if (mode === MODE.list) {
    logger.info({
      activeCount: activeRules.length,
      activeRules,
      loadedCount: loadedRules.length,
      loadedRules,
      ruleSelector,
      ruleSources,
    }, 'listing active rules');
    return STATUS_SUCCESS;
  }

  // load source
  const parser = new YamlParser();
  const sourceData = await readSource(args.source);
  const source = {
    data: sourceData,
    path: args.source,
  };
  const docs = parser.parse(source);

  const visitor = new RuleVisitor({
    rules: activeRules,
  });

  for (const root of docs) {
    for (const rule of activeRules) {
      await visitor.visitAll(ctx, rule, root);
    }
  }

  // invoke reporter
  const reporterClass = mustGet(REPORTERS, args.reporter);
  const reporter = new reporterClass();
  const report = await reporter.report(ctx.results);
  logger.info(report);

  if (ctx.errors.length === 0) {
    logger.info('all rules passed');
    const output = parser.dump(...docs);
    await writeSource(args.dest, output);
    return STATUS_SUCCESS;
  }

  logger.error({ count: ctx.errors.length, errors: ctx.errors }, 'some rules failed');
  if (args.count) {
    return Math.min(ctx.errors.length, STATUS_MAX);
  }

  return STATUS_ERROR;
}
