import { expect } from 'chai';
import { LogLevel, NullLogger } from 'noicejs';

import { VisitorContext } from '../../src/visitor/VisitorContext.js';
import { createErrorContext, makeElement } from '../helpers.js';

describe('visitor context', () => {
  it('should merge results', async () => {
    const { rule } = createErrorContext(''); // TODO: extract a makeRule helper

    const firstCtx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const nextCtx = firstCtx.mergeResult(rule, makeElement({}), {
      changes: [{
        data: {
          data: {},
          document: {
            data: {},
            source: {
              data: '',
              path: '',
            },
          },
          index: 0,
        },
        diff: {
          kind: 'N',
          rhs: {},
        },
        rule,
      }],
      errors: [{
        data: {
          data: {
            foo: 2,
          },
          document: {
            data: {},
            source: {
              data: '',
              path: '',
            },
          },
          index: 0,
        },
        err: {} as any,
        level: LogLevel.Info,
        msg: 'uh oh',
        rule,
      }],
      rule,
    });

    expect(nextCtx).to.equal(firstCtx);
    expect(nextCtx.errors.length).to.equal(1);
    expect(nextCtx.changes.length).to.equal(1);
  });
});
