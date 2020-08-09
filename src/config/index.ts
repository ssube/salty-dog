import { Config } from '@apextoaster/js-config';
import { createSchema } from '@apextoaster/js-yaml-schema';
import Ajv from 'ajv';
import { Stream } from 'bunyan';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SAFE_SCHEMA } from 'js-yaml';
import { LogLevel } from 'noicejs';
import { join } from 'path';

import ruleSchemaData from '../../rules/salty-dog.yml';

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

export function initConfig(paths: Array<string>, filename: string) {
  const include = {
    exists: existsSync,
    join,
    read: readFileSync,
    resolve: realpathSync,
    schema: DEFAULT_SAFE_SCHEMA,
  };

  createSchema({
    include,
  });

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const { definitions, name: $id } = ruleSchemaData as any;
  const schema = new Ajv({});
  schema.addSchema({
    $id,
    definitions,
  });

  const config = new Config<ConfigData>({
    key: '',
    schema,
    sources: [{
      include,
      key: '',
      name: filename,
      paths,
      type: 'file',
    }],
  });

  return config.getData();
}
