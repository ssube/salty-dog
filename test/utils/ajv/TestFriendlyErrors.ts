import { expect } from 'chai';

import { friendlyError } from '../../../src/utils/ajv';

describe('friendly errors', () => {
  it('should have a message', () => {
    const err = friendlyError({
      dataPath: 'test-path',
      keyword: 'test',
      params: { /* ? */ },
      schemaPath: 'test-path',
    });
    expect(err.msg).to.not.equal('');
  });
});
