import { Options, showCompletionScript, usage } from 'yargs';

import { VERSION_INFO } from '../version';

export const CONFIG_ARGS_NAME = 'config-name';
export const CONFIG_ARGS_PATH = 'config-path';

const RULE_OPTION: Options = {
  default: [],
  group: 'Rules:',
  type: 'array',
};

export interface Args {
  args: any;
  mode: string;
}

/**
 * Wrap yargs to exit after completion.
 *
 * @TODO: fix it to use argv, not sure if yargs can do that
 */
export function parseArgs(argv: Array<string>) {
  let mode = 'check';

  const args = usage(`Usage: salty-dog <mode> [options]`)
    .command({
      command: ['check', '*'],
      describe: 'validate the source documents',
      handler: (argv: any) => {
        mode = 'check';
      },
    })
    .command({
      command: ['fix'],
      describe: 'validate the source document and insert defaults',
      builder: (yargs: any) => {
        return yargs
          .option('coerce', {
            default: false,
            type: 'boolean',
          })
          .option('defaults', {
            default: true,
            type: 'boolean',
          });
      },
      handler: (argv: any) => {
        mode = 'fix';
      },
    })
    .command({
      command: ['list'],
      describe: 'list active rules',
      handler: (argv: any) => {
        mode = 'list';
      },
    })
    .command({
      command: ['complete'],
      describe: 'generate tab completion script for bash or zsh',
      handler: (argv: any) => {
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
    process.exit(0);
  }

  return {
    args,
    mode,
  };
}
