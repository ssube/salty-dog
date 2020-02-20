import { isNil } from 'lodash';

/* eslint-disable @typescript-eslint/ban-types */

export function doesExist<T>(val: T | null | undefined): val is T {
  return !isNil(val);
}

/**
 * Test if a value is an array with some items (length > 0).
 *
 * This is not a general replacement for `.length > 0`, since it is also a typeguard:
 * `if (hasItems(val)) else { val }` will complain that `val` is `never` in the `else`
 * branch, since it was proven not to be an array by this function, even if `val` is
 * simply empty.
 */
export function hasItems<T>(val: Array<T> | null | undefined): val is Array<T>;
export function hasItems<T>(val: ReadonlyArray<T> | null | undefined): val is ReadonlyArray<T>;
export function hasItems<T>(val: ReadonlyArray<T> | null | undefined): val is ReadonlyArray<T> {
  return (Array.isArray(val) && val.length > 0);
}

export function ensureArray<T>(val: Array<T> | undefined): Array<T> {
  if (isNil(val)) {
    return [];
  } else {
    return Array.from(val);
  }
}
