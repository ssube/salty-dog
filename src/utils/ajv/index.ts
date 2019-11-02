import { ErrorObject } from 'ajv';
import { isNil } from 'lodash';

import { SchemaRule } from '../../rule/SchemaRule';
import { VisitorContext } from '../../visitor/VisitorContext';
import { VisitorError } from '../../visitor/VisitorError';

export function friendlyError(ctx: VisitorContext, err: ErrorObject, rule: SchemaRule): VisitorError {
  return {
    data: {
      err,
      rule,
    },
    level: 'error',
    msg: friendlyErrorMessage(err, rule),
  };
}

export function friendlyErrorMessage(err: ErrorObject, rule: SchemaRule): string {
  if (isNil(err.message)) {
    return `${err.dataPath} ${err.keyword} at ${rule.select} for ${rule.name}`;
  } else {
    return `${err.dataPath} ${err.message} at ${rule.select} for ${rule.name}`;
  }
}
