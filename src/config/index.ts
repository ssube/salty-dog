import { CONFIG_SCHEMA, includeOptions } from '@apextoaster/js-yaml-schema';
import { Stream } from 'bunyan';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { LogLevel } from 'noicejs';
import { join } from 'path';

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

export function initConfig() {
  includeOptions.exists = existsSync;
  includeOptions.join = join;
  includeOptions.read = readFileSync;
  includeOptions.resolve = realpathSync;
  includeOptions.schema = CONFIG_SCHEMA;
}
