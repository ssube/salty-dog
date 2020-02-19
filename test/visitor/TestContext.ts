import { expect } from 'chai';
import { LogLevel } from 'noicejs';

import { testContext } from '../helpers/context';

describe('visitor context', () => {
  it('should merge results', () => {
    const firstCtx = testContext();
    const nextCtx = firstCtx.mergeResult({
      changes: [{
        kind: 'N',
        rhs: {},
      }],
      errors: [{
        data: {
          foo: 2,
        },
        level: LogLevel.Info,
        msg: 'uh oh',
      }],
    });

    expect(nextCtx).to.equal(firstCtx);
    expect(nextCtx.errors.length).to.equal(1);
    expect(nextCtx.changes.length).to.equal(1);
  });
});
