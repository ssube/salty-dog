import { createLogger } from 'bunyan';
import { detailed, Options } from 'yargs-parser';

import { loadConfig, CONFIG_SCHEMA } from 'src/config';
import { loadRules, resolveRules, checkRule } from 'src/rule';
import { loadSource } from 'src/source';
import { VERSION_INFO } from 'src/version';
import { safeLoad } from 'js-yaml';

const CONFIG_ARGS_NAME = 'config-name';
const CONFIG_ARGS_PATH = 'config-path';

const MAIN_ARGS: Options = {
  alias: {
    'includeTag': ['t', 'tag'],
    'mode': ['m'],
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
  count: ['v'],
  default: {
    [CONFIG_ARGS_NAME]: `.${VERSION_INFO.app.name}.yml`,
    [CONFIG_ARGS_PATH]: [],
    'excludeLevel': [],
    'excludeName': [],
    'excludeTag': [],
    'includeLevel': [],
    'includeName': [],
    'includeTag': [],
    'mode': 'check',
    'rules': [],
    'source': '-',
  },
  envPrefix: VERSION_INFO.app.name,
  string: ['mode'],
};

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

export async function main(argv: Array<string>): Promise<number> {
  const args = detailed(argv, MAIN_ARGS);
  const config = await loadConfig(args.argv[CONFIG_ARGS_NAME], ...args.argv[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args }, 'main arguments');

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
  let status = STATUS_SUCCESS;
  for (const rule of activeRules) {
    if (checkRule(rule, data)) {
      logger.info({ rule }, 'passed rule');
    } else {
      logger.warn({ rule }, 'failed rule');
      status = STATUS_ERROR;
    }
  }

  return status;
}

main(process.argv).then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});

