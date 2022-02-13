import { expect } from 'chai';
import { LogLevel, NullLogger } from 'noicejs';
import { SchemaRule } from '../../src/rule/SchemaRule.js';

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
        rule: new SchemaRule({} as any),
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
        level: LogLevel.Info,
        msg: 'uh oh',
        rule: new SchemaRule({} as any),
      }],
    });

    expect(nextCtx).to.equal(firstCtx);
    expect(nextCtx.errors.length).to.equal(1);
    expect(nextCtx.changes.length).to.equal(1);
  });
});
