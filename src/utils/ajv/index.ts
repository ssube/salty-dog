import { ErrorObject } from 'ajv';
import { isNil } from 'lodash';

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
  if (isNil(err.message)) {
    return `${err.dataPath} ${err.keyword}`;
  } else {
    return `${err.dataPath} ${err.message}`;
  }
}
