import { ErrorObject } from 'ajv';

import { VisitorError } from '../../visitor/VisitorError';

export function friendlyError(err: ErrorObject): VisitorError {
  return {
    data: {
      err,
    },
    level: 'error',
    msg: friendlyErrorMessage(err),
  };
}

export function friendlyErrorMessage(err: ErrorObject): string {
  if (err.message) {
    return `${err.dataPath} ${err.message}`;
  } else {
    return `${err.dataPath} ${err.keyword}`;
  }
}
