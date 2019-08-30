import { DEFAULT_SAFE_SCHEMA, Schema } from 'js-yaml';

import { envType } from './type/Env';
import { includeType } from './type/Include';
import { regexpType } from './type/Regexp';
import { streamType } from './type/Stream';

export const CONFIG_ENV = 'SALTY_HOME';
export const CONFIG_SCHEMA = Schema.create([DEFAULT_SAFE_SCHEMA], [
  envType,
  includeType,
  regexpType,
  streamType,
]);
