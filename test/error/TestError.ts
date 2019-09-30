import { expect } from 'chai';
import { kebabCase } from 'lodash';

import { InvalidArgumentError } from '../../src/error/InvalidArgumentError';
import { NotFoundError } from '../../src/error/NotFoundError';

const errors = [
  InvalidArgumentError,
  NotFoundError,
];

describe('errors', () => {
  for (const errorType of errors) {
    describe(kebabCase(errorType.name), () => {
      xit('should have a message', () => {
        const err = new errorType();
        expect(err.message).to.not.equal('');
      });

      xit('should include nested errors in the stack trace', () => {
        const inner = new Error('inner error');
        const err = new errorType('outer error', inner);
        expect(err.stack).to.include('inner', 'inner error message').and.include('outer', 'outer error message');
      });

      xit('should have the nested error', () => {
        const inner = new Error('inner error');
        const err = new errorType('outer error', inner);
        expect(err.cause()).to.equal(inner);
        expect(err.length).to.equal(1);
      });
    });
  }
});
