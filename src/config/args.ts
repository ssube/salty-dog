import { Options, usage } from 'yargs';

import { RuleSelector, RuleSources } from '../rule';
import { VERSION_INFO } from '../version';

export enum MODE {
  check = 'check',
  complete = 'complete',
  fix = 'fix',
  list = 'list',
}

export const VALID_MODES = new Set([MODE.check, MODE.fix, MODE.list]);

/* tslint:disable:no-any */

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

export interface ParsedArgs extends RuleSelector, RuleSources {
  [CONFIG_ARGS_NAME]: string;
  [CONFIG_ARGS_PATH]: string;
  coerce: boolean;
  count: boolean;
  defaults: boolean;
  dest: string;
  mode: string;
  rules: Array<string>;
  source: string;
}

export interface ParseResults {
  args: ParsedArgs;
  mode: MODE;
}

/**
 * Wrap yargs to exit after completion.
 *
 * @TODO: fix it to use argv, not sure if yargs can do that
 */
export function parseArgs(argv: Array<string>): ParseResults {
  let mode: MODE = MODE.check;

  const parser = usage(`Usage: salty-dog <mode> [options]`)
    .command({
      command: ['check', '*'],
      describe: 'validate the source documents',
      handler: (argi: any) => {
        mode = MODE.check;
      },
    })
    .command({
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
    .option(CONFIG_ARGS_NAME, {
      default: `.${VERSION_INFO.package.name}.yml`,
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
    .option('rule-file', {
      alias: ['r', 'rule', 'rules'],
      default: [],
      desc: 'Rules file',
      type: 'array',
    })
    .option('rule-module', {
      alias: ['m'],
      default: [],
      desc: 'Rules module',
      type: 'array',
    })
    .option('rule-path', {
      alias: ['p'],
      default: [],
      desc: 'Rules path',
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
    .version(VERSION_INFO.package.version)
    .alias('version', 'v');

  // @TODO: this should not need a cast but argv's type only has the last option (include-tag)
  // @tslint:disable-next-line:no-any
  const args = parser.argv as any;
  return {
    args,
    mode,
  };
}
