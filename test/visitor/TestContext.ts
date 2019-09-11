import { expect } from 'chai';
import { ConsoleLogger } from 'noicejs';

import { VisitorContext } from '../../src/visitor/VisitorContext';

describe('visitor context', () => {
  it('should merge results', () => {
    const firstCtx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: new ConsoleLogger(),
    });

    const nextCtx = firstCtx.mergeResult({
      changes: [{bar: 3}],
      errors: [{foo: 2}],
    });

    expect(nextCtx).to.equal(firstCtx);
    expect(nextCtx.errors.length).to.equal(1);
    expect(nextCtx.changes.length).to.equal(1);
  });
});
