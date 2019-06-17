import { createLogger } from 'bunyan';
import { Options, usage } from 'yargs';

import { loadConfig } from 'src/config';
import { YamlParser } from 'src/parser/YamlParser';
import { loadRules, resolveRules } from 'src/rule';
import { loadSource, writeSource } from 'src/source';
import { VERSION_INFO } from 'src/version';
import { VisitorContext } from 'src/visitor/context';

const CONFIG_ARGS_NAME = 'config-name';
const CONFIG_ARGS_PATH = 'config-path';

const RULE_OPTION: Options = {
  default: [],
  type: 'array',
};

const MAIN_ARGS = usage(`Usage: $0 <mode> [options]`)
  .option(CONFIG_ARGS_NAME, {
    default: `.${VERSION_INFO.app.name}.yml`,
    type: 'string',
  })
  .option(CONFIG_ARGS_PATH, {
    default: [],
    type: 'array',
  })
  .option('coerce', {
    default: false,
    type: 'boolean',
  })
  .option('count', {
    alias: ['c'],
    default: false,
    type: 'boolean',
  })
  .option('dest', {
    alias: ['d'],
    default: '-',
    type: 'string',
  })
  .option('format', {
    alias: ['f'],
    default: 'yaml',
    type: 'string',
  })
  .option('mode', {
    alias: ['m'],
    choices: ['check', 'fix'],
    default: 'check',
    type: 'string',
  })
  .option('rules', {
    alias: ['r'],
    default: [],
    type: 'array',
  })
  .option('source', {
    alias: ['s'],
    default: '-',
    type: 'string',
  })
  .option('excludeLevel', RULE_OPTION)
  .option('excludeName', RULE_OPTION)
  .option('excludeTag', RULE_OPTION)
  .option('includeLevel', RULE_OPTION)
  .option('includeName', RULE_OPTION)
  .option('includeTag', {
    ...RULE_OPTION,
    alias: ['t', 'tag'],
  })
  .help();

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

export async function main(argv: Array<string>): Promise<number> {
  const args = MAIN_ARGS.argv;
  const config = await loadConfig(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args }, 'main arguments');

  // const schema = new Schema();
  const result = { errors: [], valid: true }; // schema.match(config);
  if (!result.valid) {
    logger.error({ errors: result.errors }, 'config failed to validate');
    return STATUS_ERROR;
  }

  const rules = await loadRules(args.rules);
  const source = await loadSource(args.source);

  const parser = new YamlParser();
  const data = parser.parse(source);

  const activeRules = await resolveRules(rules, args as any);
  const ctx = new VisitorContext({
    coerce: args.coerce,
    defaults: args.mode === 'fix',
    logger,
  });

  switch (args.mode) {
    case 'check':
    case 'fix':
      for (const rule of activeRules) {
        if (rule.visit(ctx, data)) {
          logger.info({ rule }, 'passed rule');
        } else {
          logger.warn({ rule }, 'failed rule');
        }
      }
      break;
    default:
      ctx.error({ mode: args.mode }, 'unsupported mode');
  }

  if (ctx.errors.length > 0) {
    logger.error({ errors: ctx.errors }, 'some rules failed');
    if (args.count) {
      return Math.min(ctx.errors.length, 255);
    } else {
      return STATUS_ERROR;
    }
  } else {
    logger.info('all rules passed');
    const output = parser.dump(data);
    await writeSource(args.dest, output);
    return STATUS_SUCCESS;
  }
}

main(process.argv).then((status) => process.exit(status)).catch((err) => {
  /* tslint:disable-next-line:no-console */
  console.error('uncaught error during main:', err);
  process.exit(STATUS_ERROR);
});
