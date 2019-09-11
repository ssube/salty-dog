import { Type as YamlType } from 'js-yaml';

import { NotFoundError } from '../../error/NotFoundError';

const ALLOWED_STREAMS = new Set([
  'stdout',
  'stderr',
]);

export const streamType = new YamlType('!stream', {
  kind: 'scalar',
  resolve(name: string) {
    if (ALLOWED_STREAMS.has(name) && Reflect.has(process, name)) {
      return true;
    } else {
      throw new NotFoundError(`process stream not found: ${name}`);
    }
  },
  construct(name: string) {
    return Reflect.get(process, name);
  },
});
