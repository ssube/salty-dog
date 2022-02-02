import { expect } from 'chai';
import { LogLevel, NullLogger } from 'noicejs';

import { VisitorContext } from '../../src/visitor/VisitorContext.js';

describe('visitor context', () => {
  it('should merge results', async () => {
    const firstCtx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

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
