import yargs, { Options } from 'yargs';

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

const RULE_OPTION: Options = {
  default: [],
  group: 'Rules:',
  type: 'array',
};

export interface Args {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  args: any;
  mode: string;
}

export interface ParsedArgs extends RuleSelector, RuleSources {
  [CONFIG_ARGS_NAME]: string;
  [CONFIG_ARGS_PATH]: string;
  coerce: boolean;
  count: boolean;
  defaults: boolean;
  dest: string;
  mode: string;
  mutate: boolean;
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

  const parser = yargs(argv).usage('Usage: salty-dog <mode> [options]')
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
        default: [],
        group: 'Config:',
        type: 'array',
      },
      'count': {
        alias: ['c'],
        default: false,
        desc: 'Exit with error count',
        type: 'boolean',
      },
      'dest': {
        alias: ['d'],
        default: '-',
        type: 'string',
      },
      'exclude-level': RULE_OPTION,
      'exclude-name': RULE_OPTION,
      'exclude-tag': RULE_OPTION,
      'format': {
        alias: ['f'],
        default: 'yaml',
        type: 'string',
      },
      'include-level': {
        ...RULE_OPTION,
        alias: ['l', 'level'],
      },
      'include-name': {
        ...RULE_OPTION,
        alias: ['n', 'name'],
      },
      'include-tag': {
        ...RULE_OPTION,
        alias: ['t', 'tag'],
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

  // @TODO: this should not need a cast but the parser's type omits command options and doesn't expose camelCase
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const args = parser.parse(argv) as any;

  return {
    args,
    mode,
  };
}
