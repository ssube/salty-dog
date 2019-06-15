import { BaseError } from 'noicejs/error/BaseError';

export class NotFoundError extends BaseError {
  constructor(msg = 'value not found', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
