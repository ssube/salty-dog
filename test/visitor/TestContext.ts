import { expect } from 'chai';
import { VisitorContext } from 'src/visitor/context';
import { ConsoleLogger } from 'noicejs';

describe('visitor context', () => {
  it('should merge results', () => {
    const firstCtx = new VisitorContext({
      coerce: false,
      defaults: false,
      logger: new ConsoleLogger(),
      mutate: false,
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
