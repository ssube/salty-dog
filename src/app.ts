import { createLogger } from 'bunyan';
import { showCompletionScript } from 'yargs';

import { loadConfig } from './config';
import { CONFIG_ARGS_NAME, CONFIG_ARGS_PATH, MODE, parseArgs, VALID_MODES } from './config/args';
import { YamlParser } from './parser/YamlParser';
import { createRuleSelector, createRuleSources, loadRules, resolveRules, visitRules } from './rule';
import { readSource, writeSource } from './source';
import { VERSION_INFO } from './version';
import { VisitorContext } from './visitor/VisitorContext';

export const STATUS_SUCCESS = 0;
export const STATUS_ERROR = 1;
export const STATUS_MAX = 255;

export async function main(argv: Array<string>): Promise<number> {
  const { args, mode } = await parseArgs(argv.slice(2));
  if (mode === MODE.complete) {
    showCompletionScript();
    return STATUS_SUCCESS;
  }

  const config = await loadConfig(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args, mode }, 'main arguments');

  // check mode
  if (!VALID_MODES.has(mode)) {
    logger.error({ mode }, 'unsupported mode');
    return STATUS_ERROR;
  }

  const ctx = new VisitorContext({
    logger,
    schemaOptions: {
      coerce: args.coerce,
      defaults: args.defaults,
      mutate: args.mutate,
    },
  });

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

  const parser = new YamlParser();
  const source = await readSource(args.source);
  const docs = parser.parse(source);

  for (const data of docs) {
    await visitRules(ctx, activeRules, data);
  }

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
