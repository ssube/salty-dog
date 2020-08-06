import { loadConfig } from '@apextoaster/js-config';
import { createLogger } from 'bunyan';
import { showCompletionScript } from 'yargs';

import { ConfigData, initConfig } from './config';
import { CONFIG_ARGS_NAME, CONFIG_ARGS_PATH, MODE, parseArgs } from './config/args';
import { YamlParser } from './parser/YamlParser';
import { createRuleSelector, createRuleSources, loadRules, resolveRules, validateConfig } from './rule';
import { RuleVisitor } from './rule/RuleVisitor';
import { readSource, writeSource } from './source';
import { VERSION_INFO } from './version';
import { VisitorContext } from './visitor/VisitorContext';

const ARGS_START = 2;
export const STATUS_SUCCESS = 0;
export const STATUS_ERROR = 1;
export const STATUS_MAX = 255;

export async function main(argv: Array<string>): Promise<number> {
  initConfig();

  const { args, mode } = await parseArgs(argv.slice(ARGS_START));
  if (mode === MODE.complete) {
    showCompletionScript();
    return STATUS_SUCCESS;
  }

  const config = loadConfig<ConfigData>(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args, mode }, 'main arguments');

  // load rules
  const ctx = new VisitorContext({
    logger,
    schemaOptions: {
      coerce: args.coerce,
      defaults: args.defaults,
      mutate: args.mutate,
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
  const source = await readSource(args.source);
  const docs = parser.parse(source);

  const visitor = new RuleVisitor({
    rules: activeRules,
  });

  for (const root of docs) {
    await visitor.visit(ctx, root);
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
