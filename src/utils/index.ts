import { isNil } from 'lodash';

export function hasItems<T>(val: Array<T> | null | undefined): val is Array<T> {
  return (Array.isArray(val) && val.length > 0);
}

export function ensureArray<T>(val: Array<T> | undefined): Array<T> {
  if (isNil(val)) {
    return [];
  } else {
    return Array.from(val);
  }
}
