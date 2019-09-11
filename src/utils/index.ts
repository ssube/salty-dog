import { isNil } from 'lodash';

export function isNilOrEmpty(val: Array<unknown> | null | undefined): val is Array<unknown> {
  return (Array.isArray(val) && val.length > 0);
}

export function ensureArray<T>(val: Array<T> | undefined): Array<T> {
  if (isNil(val)) {
    return [];
  } else {
    return Array.from(val);
  }
}
