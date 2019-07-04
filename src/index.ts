import { createLogger } from 'bunyan';
import { Options, showCompletionScript, usage } from 'yargs';

import { loadConfig } from 'src/config';
import { YamlParser } from 'src/parser/YamlParser';
import { loadRules, resolveRules, visitRules } from 'src/rule';
import { loadSource, writeSource } from 'src/source';
import { VERSION_INFO } from 'src/version';
import { VisitorContext } from 'src/visitor/context';

const CONFIG_ARGS_NAME = 'config-name';
const CONFIG_ARGS_PATH = 'config-path';

const MODES = ['check', 'fix', 'list'];

const RULE_OPTION: Options = {
  default: [],
  group: 'Rules:',
  type: 'array',
};

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

export async function main(argv: Array<string>): Promise<number> {
  let mode = 'check';

  const args = usage(`Usage: salty-dog <mode> [options]`)
    .command({
      command: ['check', '*'],
      describe: 'validate the source documents',
      handler: (argv) => {
        mode = 'check';
      },
    })
    .command({
      command: ['fix'],
      describe: 'validate the source document and insert defaults',
      builder: (yargs: any) => {
        return yargs.option('coerce', {
          default: false,
          type: 'boolean',
        });
      },
      handler: (argv) => {
        mode = 'fix';
      },
    })
    .command({
      command: ['list'],
      describe: 'list active rules',
      handler: (argv) => {
        mode = 'list';
      },
    })
    .command({
      command: ['complete'],
      describe: 'generate tab completion script for bash or zsh',
      handler: (argv) => {
        mode = 'complete';
      },
    })
    .option(CONFIG_ARGS_NAME, {
      default: `.${VERSION_INFO.app.name}.yml`,
      group: 'Config:',
      type: 'string',
    })
    .option(CONFIG_ARGS_PATH, {
      default: [],
      group: 'Config:',
      type: 'array',
    })
    .option('count', {
      alias: ['c'],
      default: false,
      desc: 'Exit with error count',
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
    .option('rules', {
      alias: ['r'],
      default: [],
      desc: 'Rules file',
      type: 'array',
    })
    .option('source', {
      alias: ['s'],
      default: '-',
      type: 'string',
    })
    .option('exclude-level', RULE_OPTION)
    .option('exclude-name', RULE_OPTION)
    .option('exclude-tag', RULE_OPTION)
    .option('include-level', RULE_OPTION)
    .option('include-name', RULE_OPTION)
    .option('include-tag', {
      ...RULE_OPTION,
      alias: ['t', 'tag'],
    })
    .help()
    .version(VERSION_INFO.app.version)
    .alias('version', 'v')
    .argv;

  if (mode === 'complete') {
    showCompletionScript();
    return STATUS_SUCCESS;
  }

  const config = await loadConfig(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);
  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args }, 'main arguments');

  // check mode
  if (!MODES.includes(mode)) {
    logger.error({ mode }, 'unsupported mode');
    return STATUS_ERROR;
  }

  // const schema = new Schema();
  const result = { errors: [], valid: true }; // schema.match(config);
  if (!result.valid) {
    logger.error({ errors: result.errors }, 'config failed to validate');
    return STATUS_ERROR;
  }

  const coerce = Reflect.has(args, 'coerce') ? Reflect.get(args, 'coerce') : false;
  const ctx = new VisitorContext({
    coerce,
    defaults: mode === 'fix',
    logger,
  });

  const rules = await loadRules(args.rules, ctx.ajv);
  const activeRules = await resolveRules(rules, args as any);

  if (mode === 'list') {
    logger.info({ rules: activeRules }, 'listing active rules');
    return STATUS_SUCCESS;
  }

  const parser = new YamlParser();
  const source = await loadSource(args.source);
  let docs = parser.parse(source);

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
