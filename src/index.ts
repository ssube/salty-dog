import { createLogger } from 'bunyan';
import { detailed, Options } from 'yargs-parser';

import { loadConfig } from 'src/config';
import { VERSION_INFO } from 'src/version';

const CONFIG_ARGS_NAME = 'config-name';
const CONFIG_ARGS_PATH = 'config-path';

const MAIN_ARGS: Options = {
  array: [CONFIG_ARGS_PATH],
  count: ['v'],
  default: {
    [CONFIG_ARGS_NAME]: `.${VERSION_INFO.app.name}.yml`,
    [CONFIG_ARGS_PATH]: [],
  },
  envPrefix: VERSION_INFO.app.name,
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

  if (args.argv.test) {
    logger.info('config is valid');
    return STATUS_SUCCESS;
  }

  return STATUS_SUCCESS;
}

main(process.argv).then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});

