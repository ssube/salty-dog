import { RuleSelector, RuleSources } from '../rule';
import { VERSION_INFO } from '../version';

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const yargs = require('yargs');

export enum MODE {
  check = 'check',
  complete = 'complete',
  fix = 'fix',
  list = 'list',
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export const CONFIG_ARGS_NAME = 'config-name';
export const CONFIG_ARGS_PATH = 'config-path';

const RULE_OPTION = {
  default: [],
  group: 'Rules:',
  type: 'array',
};

export interface Args {
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

  const parser = yargs.usage('Usage: salty-dog <mode> [options]')
    .command({
      command: ['check', '*'],
      describe: 'validate the source documents',
      handler: (argi: any) => {
        mode = MODE.check;
      },
    })
    .command({
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
      handler: (argi: any) => {
        mode = MODE.fix;
      },
    })
    .command({
      command: ['list'],
      describe: 'list active rules',
      handler: (argi: any) => {
        mode = MODE.list;
      },
    })
    .command({
      command: ['complete'],
      describe: 'generate tab completion script for bash or zsh',
      handler: (argi: any) => {
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
  const args = parser.parse(argv) as any;

  return {
    args,
    mode,
  };
}
