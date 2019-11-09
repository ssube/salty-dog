import { Stream } from 'bunyan';
import { isNil, isString } from 'lodash';
import { LogLevel } from 'noicejs';
import { join } from 'path';

import { NotFoundError } from '../error/NotFoundError';
import { YamlParser } from '../parser/YamlParser';
import { readFile } from '../source';
import { CONFIG_ENV, CONFIG_SCHEMA } from './schema';
import { includeSchema } from './type/Include';

includeSchema.schema = CONFIG_SCHEMA;

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
 * With the given name, generate all potential config paths in their complete, absolute form.
 *
 * This will include the value of `SALTY_HOME`, `HOME`, the current working directory, and any extra paths
 * passed as the final arguments.
 */
export function completePaths(name: string, extras: Array<string>): Array<string> {
  const paths = [];

  const env = process.env[CONFIG_ENV];
  if (isString(env)) {
    paths.push(join(env, name));
  }

  const home = process.env.HOME;
  if (isString(home)) {
    paths.push(join(home, name));
  }

  if (isString(__dirname)) {
    paths.push(join(__dirname, name));
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
    if (!isNil(data)) {
      const parser = new YamlParser();
      const [head] = parser.parse(data);
      return head;
    }
  }

  throw new NotFoundError('unable to load config');
}

export async function readConfig(path: string): Promise<string | undefined> {
  try {
    // need to await this read to catch the error, need to catch the error to check the code
    /* eslint-disable-next-line sonarjs/prefer-immediate-return */
    const data = await readFile(path, {
      encoding: 'utf-8',
    });
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return;
    }
    throw err;
  }
}
