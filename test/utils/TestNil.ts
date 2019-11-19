import { expect } from 'chai';

import { NotFoundError } from '../../src/error/NotFoundError';
import { mustExist } from '../../src/utils';

describe('nil helpers', () => {
  describe('must exist helper', () => {
    it('should return set values', () => {
      const TEST_NUMBER = 3;
      const TEST_STRING = '3';
      expect(mustExist(TEST_NUMBER)).to.equal(TEST_NUMBER);
      expect(mustExist(TEST_STRING)).to.equal(TEST_STRING);
    });

    it('should throw on nil values', () => {
      /* eslint-disable-next-line no-null/no-null */
      expect(() => mustExist(null)).to.throw(NotFoundError);
      expect(() => mustExist(undefined)).to.throw(NotFoundError);
    });
  });
});
