import { expect } from 'chai';

import { friendlyError } from '../../../src/utils/ajv';

describe('friendly errors', () => {
  it('should have a message', () => {
    const err = friendlyError({
      keyword: 'test',
      dataPath: 'test-path',
      schemaPath: 'test-path',
      params: { /* ? */ },
    });
    expect(err.msg).to.not.equal('');
  });
});
