import { createLogger } from 'bunyan';
import { safeDump, safeLoad } from 'js-yaml';
import { detailed, Options } from 'yargs-parser';

import { CONFIG_SCHEMA, loadConfig } from 'src/config';
import { checkRule, loadRules, resolveRules } from 'src/rule';
import { loadSource, writeSource } from 'src/source';
import { VERSION_INFO } from 'src/version';

const CONFIG_ARGS_NAME = 'config-name';
const CONFIG_ARGS_PATH = 'config-path';

const MAIN_ARGS: Options = {
  alias: {
    'count': ['c'],
    'dest': ['d'],
    'format': ['f'],
    'includeTag': ['t', 'tag'],
    'mode': ['m'],
    'source': ['s'],
  },
  array: [
    CONFIG_ARGS_PATH,
    'excludeLevel',
    'excludeName',
    'excludeTag',
    'includeLevel',
    'includeName',
    'includeTag',
    'rules',
  ],
  boolean: [
    'count',
  ],
  count: ['v'],
  default: {
    [CONFIG_ARGS_NAME]: `.${VERSION_INFO.app.name}.yml`,
    [CONFIG_ARGS_PATH]: [],
    'count': false,
    'dest': '-',
    'excludeLevel': [],
    'excludeName': [],
    'excludeTag': [],
    'format': 'yaml',
    'includeLevel': [],
    'includeName': [],
    'includeTag': [],
    'mode': 'check',
    'rules': [],
    'source': '-',
  },
  envPrefix: VERSION_INFO.app.name,
  string: [
    'mode',
  ],
};

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

export async function main(argv: Array<string>): Promise<number> {
  const args = detailed(argv, MAIN_ARGS);
  const config = await loadConfig(args.argv[CONFIG_ARGS_NAME], ...args.argv[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args: args.argv }, 'main arguments');

  // const schema = new Schema();
  const result = { errors: [], valid: true }; // schema.match(config);
  if (!result.valid) {
    logger.error({ errors: result.errors }, 'config failed to validate');
    return STATUS_ERROR;
  }

  const rules = await loadRules(args.argv.rules);
  const source = await loadSource(args.argv.source);
  const data = safeLoad(source, {
    schema: CONFIG_SCHEMA,
  });
  const activeRules = await resolveRules(rules, args.argv as any);

  // run rules
  let errors = 0;
  switch (args.argv.mode) {
    case 'check':
      for (const rule of activeRules) {
        if (checkRule(rule, data, logger)) {
          logger.info({ rule }, 'passed rule');
        } else {
          logger.warn({ rule }, 'failed rule');
          ++errors;
        }
      }
      break;
    default:
      logger.error({ mode: args.argv.mode }, 'unsupported mode');
      ++errors;
  }

  if (errors > 0) {
    logger.error({ errors }, 'some rules failed');
    if (args.argv.count) {
      return Math.min(errors, 255);
    } else {
      return STATUS_ERROR;
    }
  } else {
    logger.info('all rules passed');
    const output = safeDump(data, {
      schema: CONFIG_SCHEMA,
    });
    await writeSource(args.argv.dest, output);
    return STATUS_SUCCESS;
  }
}

main(process.argv).then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});

