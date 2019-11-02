import { expect } from 'chai';
import { NullLogger } from 'noicejs';

import { SchemaRule } from '../../../src/rule/SchemaRule';
import { friendlyError } from '../../../src/utils/ajv';
import { VisitorContext } from '../../../src/visitor/VisitorContext';

const TEST_NAME = 'test';

describe('friendly errors', () => {
  it('should have a message', () => {
    const err = friendlyError(new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    }), {
      dataPath: 'test-path',
      keyword: TEST_NAME,
      params: { /* ? */ },
      schemaPath: 'test-path',
    }, new SchemaRule({
      check: {},
      desc: TEST_NAME,
      level: 'info',
      name: TEST_NAME,
      select: '',
      tags: [TEST_NAME],
    }));
    expect(err.msg).to.not.equal('');
  });
});
