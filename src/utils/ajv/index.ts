import { ErrorObject } from 'ajv';

import { VisitorError } from '../../visitor/VisitorError';

export function friendlyError(err: ErrorObject): VisitorError {
  return {
    data: {},
    level: 'error',
    msg: err.message || err.keyword,
  };
}
