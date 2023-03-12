import { LogLevel } from 'noicejs';
import yargs from 'yargs';

import { RuleSources } from '../rule/load.js';
import { RuleSelector } from '../rule/resolve.js';
import { VERSION_INFO } from '../version.js';

export enum MODE {
  check = 'check',
  complete = 'complete',
  fix = 'fix',
  list = 'list',
}

export const CONFIG_ARGS_NAME = 'config-name';
export const CONFIG_ARGS_PATH = 'config-path';

export interface ParsedArgs extends RuleSelector, RuleSources {
  [CONFIG_ARGS_NAME]: string;
  [CONFIG_ARGS_PATH]: Array<string>;
  coerce?: boolean;
  count: boolean;
  defaults?: boolean;
  dest: string;
  mutate?: boolean;
  reporter: string;
  source: string;
}

export interface ParseResults {
  args: ParsedArgs;
  mode: MODE;
}

/**
 * Wrap yargs to exit after completion.
 */
export async function parseArgs(argv: Array<string>): Promise<ParseResults> {
  let mode: MODE = MODE.check;

  const parser = yargs(argv)
    .usage('Usage: salty-dog <mode> [options]')
    .command({
      command: ['check', '*'],
      describe: 'validate the source documents',
      handler: (argi: unknown) => {
        mode = MODE.check;
      },
    })
    .command({
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      builder: (cmd: any) => cmd.options({
        coerce: {
          default: false,
          type: 'boolean',
        },
        defaults: {
          default: true,
          type: 'boolean',
        },
        mutate: {
          default: true,
          type: 'boolean',
        },
      }),
      command: ['fix'],
      describe: 'validate the source document and insert defaults',
      handler: (argi: unknown) => {
        mode = MODE.fix;
      },
    })
    .command({
      command: ['list'],
      describe: 'list active rules',
      handler: (argi: unknown) => {
        mode = MODE.list;
      },
    })
    .command({
      command: ['complete'],
      describe: 'generate tab completion script for bash or zsh',
      handler: (argi: unknown) => {
        mode = MODE.complete;
      },
    })
    .options({
      [CONFIG_ARGS_NAME]: {
        default: `.${VERSION_INFO.package.name}.yml`,
        group: 'Config:',
        type: 'string',
      },
      [CONFIG_ARGS_PATH]: {
        default: [] as Array<string>,
        group: 'Config:',
        string: true,
        type: 'array',
      },
      'count': {
        alias: ['c'],
        default: false,
        desc: 'Exit with error count',
        type: 'boolean',
      },
      'dest': {
        alias: ['d', 'destination'],
        default: '-',
        type: 'string',
      },
      'exclude-level': {
        default: [] as Array<LogLevel>,
        group: 'Rules:',
        string: true,
        type: 'array',
      },
      'exclude-name': {
        default: [] as Array<string>,
        group: 'Rules:',
        string: true,
        type: 'array',
      },
      'exclude-tag': {
        default: [] as Array<string>,
        group: 'Rules:',
        string: true,
        type: 'array',
      },
      'format': {
        alias: ['f'],
        default: 'yaml',
        type: 'string',
      },
      'include-level': {
        alias: ['l', 'level'],
        default: [] as Array<LogLevel>,
        group: 'Rules:',
        string: true,
        type: 'array',
      },
      'include-name': {
        alias: ['n', 'name'],
        default: [] as Array<string>,
        group: 'Rules:',
        string: true,
        type: 'array',
      },
      'include-tag': {
        alias: ['t', 'tag'],
        default: [] as Array<string>,
        group: 'Rules:',
        string: true,
        type: 'array',
      },
      'reporter': {
        alias: ['report'],
        default: 'summary',
        desc: 'Reporter format',
        type: 'string',
      },
      'rule-file': {
        alias: ['r', 'rule', 'rules'],
        default: [],
        desc: 'Rules file',
        type: 'array',
      },
      'rule-module': {
        alias: ['m'],
        default: [],
        desc: 'Rules module',
        type: 'array',
      },
      'rule-path': {
        alias: ['p'],
        default: [],
        desc: 'Rules path',
        type: 'array',
      },
      'source': {
        alias: ['s'],
        default: '-',
        type: 'string',
      },
    })
    .help()
    .alias('help', 'h')
    .version(VERSION_INFO.package.version)
    .alias('version', 'v');

  // some of the enums complain about a type of `Array<string> | Array<enum>` without this cast
  const args = await parser.parse(argv) as ParsedArgs;
  return {
    args,
    mode,
  };
}
