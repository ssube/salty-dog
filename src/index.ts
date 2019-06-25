import { createLogger } from 'bunyan';
import { applyDiff, diff } from 'deep-diff';
import { cloneDeep } from 'lodash';
import { Options, usage } from 'yargs';

import { loadConfig } from 'src/config';
import { YamlParser } from 'src/parser/YamlParser';
import { loadRules, resolveRules } from 'src/rule';
import { loadSource, writeSource } from 'src/source';
import { VERSION_INFO } from 'src/version';
import { VisitorContext } from 'src/visitor/context';

const CONFIG_ARGS_NAME = 'config-name';
const CONFIG_ARGS_PATH = 'config-path';

const MODES = ['check', 'fix'];

const RULE_OPTION: Options = {
  default: [],
  group: 'Rules:',
  type: 'array',
};

const MAIN_ARGS = usage(`Usage: salty-dog <mode> [options]`)
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
  .option('coerce', {
    default: false,
    type: 'boolean',
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
  .option('mode', {
    alias: ['m'],
    choices: ['check', 'fix'],
    default: 'check',
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
  .help();

const STATUS_SUCCESS = 0;
const STATUS_ERROR = 1;

export async function main(argv: Array<string>): Promise<number> {
  const args = MAIN_ARGS.argv;
  const config = await loadConfig(args[CONFIG_ARGS_NAME], ...args[CONFIG_ARGS_PATH]);

  const logger = createLogger(config.data.logger);
  logger.info(VERSION_INFO, 'version info');
  logger.info({ args }, 'main arguments');

  // check mode
  if (!MODES.includes(args.mode)) {
    logger.error({ mode: args.mode }, 'unsupported mode');
  }

  // const schema = new Schema();
  const result = { errors: [], valid: true }; // schema.match(config);
  if (!result.valid) {
    logger.error({ errors: result.errors }, 'config failed to validate');
    return STATUS_ERROR;
  }

  const ctx = new VisitorContext({
    coerce: args.coerce,
    defaults: args.mode === 'fix',
    logger,
  });

  const parser = new YamlParser();
  const source = await loadSource(args.source);
  let docs = parser.parse(source);

  const rules = await loadRules(args.rules, ctx.ajv);
  const activeRules = await resolveRules(rules, args as any);

  for (const data of docs) {
    for (const rule of activeRules) {
      const items = await rule.pick(ctx, data);
      for (const item of items) {
        const itemCopy = cloneDeep(item);
        const itemResult = await rule.visit(ctx, itemCopy);

        if (itemResult.errors.length > 0) {
          logger.warn({ count: itemResult.errors.length, rule }, 'rule failed');

          ctx.mergeResult(itemResult);
        } else {
          const itemDiff = diff(item, itemCopy);
          if (Array.isArray(itemDiff) && itemDiff.length > 0) {
            logger.info({ diff: itemDiff, item, rule }, 'rule passed with modifications');

            applyDiff(item, itemCopy);
          } else {
            logger.info({ rule }, 'rule passed');
          }
        }
      }
    }
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
