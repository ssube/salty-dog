import { doesExist, NotFoundError } from '@apextoaster/js-utils';
import { Stream } from 'bunyan';
import { BaseError, LogLevel } from 'noicejs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { YamlParser } from '../parser/YamlParser.js';
import { readSource } from '../source.js';

export const CONFIG_ENV = 'SALTY_HOME';

export interface ConfigData {
  data: {
    logger: {
      level: LogLevel;
      name: string;
      streams: Array<Stream>;
    };
  };
}

/**
 * Path to project root directory.
 */
export function dirName(): string {
  if (doesExist(import.meta) && doesExist(import.meta.url)) {
    return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  } else {
    return process.cwd();
  }
}

/**
 * With the given name, generate all potential config paths in their complete, absolute form.
 *
 * This will include the value of `SALTY_HOME`, `HOME`, the current working directory, and any extra paths
 * passed as the final arguments.
 */
export function completePaths(name: string, extras: Array<string>): Array<string> {
  const paths = [];

  const env = process.env[CONFIG_ENV];
  if (typeof env === 'string') {
    paths.push(join(env, name));
  }

  const home = process.env.HOME;
  if (typeof home === 'string') {
    paths.push(join(home, name));
  }

  const cwd = dirName();
  if (cwd !== '') {
    paths.push(join(cwd, name));
  }

  for (const e of extras) {
    paths.push(join(e, name));
  }

  return paths;
}

export async function loadConfig(name: string, ...extras: Array<string>): Promise<ConfigData> {
  const paths = completePaths(name, extras);

  for (const p of paths) {
    const data = await readConfig(p);
    if (doesExist(data)) {
      const parser = new YamlParser();
      const [head] = parser.parse(data);

      /* eslint-disable-next-line sonarjs/prefer-immediate-return,@typescript-eslint/no-explicit-any */
      return head as any; // TODO: validate config
    }
  }

  throw new NotFoundError('unable to load config');
}

export function errorCode(err: unknown): string | undefined {
  if (err instanceof Error) {
    return (err as NodeJS.ErrnoException).code; // === 'ENOENT'
  }

  /* eslint-disable-next-line sonarjs/no-redundant-jump */
  return;
}

export async function readConfig(path: string): Promise<string | undefined> {
  try {
    // need to await this read to catch the error, need to catch the error to check the code
    /* eslint-disable-next-line sonarjs/prefer-immediate-return */
    const data = await readSource(path);
    return data;
  } catch (err) {
    if (errorCode(err) === 'ENOENT') {
      return;
    } else {
      throw err;
    }
  }
}
