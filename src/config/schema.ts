import { DEFAULT_SAFE_SCHEMA, Schema } from 'js-yaml';

import { envType } from 'src/config/type/Env';
import { includeType } from 'src/config/type/Include';
import { regexpType } from 'src/config/type/Regexp';
import { streamType } from 'src/config/type/Stream';

export const CONFIG_ENV = 'SALTY_HOME';
export const CONFIG_SCHEMA = Schema.create([DEFAULT_SAFE_SCHEMA], [
  envType,
  includeType,
  regexpType,
  streamType,
]);
