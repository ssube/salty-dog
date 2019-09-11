import { createLogger } from 'bunyan';

import { loadConfig } from './config';
import { CONFIG_ARGS_NAME, CONFIG_ARGS_PATH, parseArgs } from './config/args';
import { YamlParser } from './parser/YamlParser';
import { loadRules, resolveRules, visitRules } from './rule';
import { loadSource, writeSource } from './source';
import { VERSION_INFO } from './version';
import { VisitorContext } from './visitor/VisitorContext';

enum MODES {
  check = 'check',
  fix = 'fix',
  list = 'list',
}

const MODES_LIST: Array<string> = [MODES.check, MODES.fix, MODES.list];

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

export async function main(argv: Array<string>): Promise<number> {
  const { args, mode } = parseArgs(argv);
  const config = await loadConfig(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args }, 'main arguments');

  // check mode
  if (!MODES_LIST.includes(mode)) {
    logger.error({ mode }, 'unsupported mode');
    return STATUS_ERROR;
  }

  const ctx = new VisitorContext({
    innerOptions: {
      coerce: args.coerce,
      defaults: args.defaults,
      mutate: mode === 'fix',
    },
    logger,
  });

  const rules = await loadRules(args.rules, ctx);
  const activeRules = await resolveRules(rules, args as any);

  if (mode === 'list') {
    logger.info({ rules: activeRules }, 'listing active rules');
    return STATUS_SUCCESS;
  }

  const parser = new YamlParser();
  const source = await loadSource(args.source);
  const docs = parser.parse(source);

  for (const data of docs) {
    await visitRules(ctx, activeRules, data);
  }

  if (ctx.errors.length > 0) {
    logger.error({ count: ctx.errors.length, errors: ctx.errors }, 'some rules failed');
    if (args.count) {
      return Math.min(ctx.errors.length, 255);
    } else {
      return STATUS_ERROR;
    }
  } else {
    logger.info('all rules passed');
    const output = parser.dump(...docs);
    await writeSource(args.dest, output);
    return STATUS_SUCCESS;
  }
}

main(process.argv).then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});
