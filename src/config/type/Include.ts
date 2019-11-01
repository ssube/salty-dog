import { existsSync, readFileSync, realpathSync } from 'fs';
import { SAFE_SCHEMA, safeLoad, Type as YamlType } from 'js-yaml';
import { BaseError } from 'noicejs';
import { join } from 'path';

import { NotFoundError } from '../../error/NotFoundError';

// work around the circular dependency by setting the schema later
export const includeSchema = {
  schema: SAFE_SCHEMA,
};

export const includeType = new YamlType('!include', {
  kind: 'scalar',
  resolve(path: string) {
    try {
      const canonical = resolvePath(path);
      // throws in node 11+
      if (existsSync(canonical)) {
        return true;
      } else {
        throw new NotFoundError('included file does not exist');
      }
    } catch (err) {
      throw new NotFoundError('included file does not exist', err);
    }
  },
  construct(path: string): unknown {
    try {
      return safeLoad(readFileSync(resolvePath(path), {
        encoding: 'utf-8',
      }), {
        schema: includeSchema.schema,
      });
    } catch (err) {
      throw new BaseError('error including file', err);
    }
  },
});

export function resolvePath(path: string): string {
  if (path[0] === '.') {
    return realpathSync(join(__dirname, path));
  } else {
    return realpathSync(path);
  }
}
