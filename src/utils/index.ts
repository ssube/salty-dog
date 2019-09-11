export function isNilOrEmpty(val: Array<unknown> | null | undefined): val is Array<unknown> {
  return (Array.isArray(val) && val.length > 0);
}
