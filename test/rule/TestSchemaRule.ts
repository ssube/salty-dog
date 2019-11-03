import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { stub } from 'sinon';

import { friendlyError, SchemaRule } from '../../src/rule/SchemaRule';
import { VisitorContext } from '../../src/visitor/VisitorContext';
import { describeLeaks, itLeaks } from '../helpers/async';

/* eslint-disable @typescript-eslint/unbound-method */

const TEST_NAME = 'test-rule';

describeLeaks('schema rule', async () => {
  itLeaks('should pick items from the scope', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    });
    const data = {
      foo: 3,
    };
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: 'info',
      name: 'foo',
      select: '$.foo',
      tags: [],
    });
    const results = await rule.pick(ctx, data);

    expect(results).to.deep.equal([data.foo]);
  });

  itLeaks('should filter out items', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    });

    const data = {
      foo: 3,
    };
    const rule = new SchemaRule({
      check: {},
      desc: '',
      filter: {
        properties: {
          foo: {
            type: 'number',
          },
        },
        type: 'object',
      },
      level: 'info',
      name: 'foo',
      select: '$.foo',
      tags: [],
    });

    const results = await rule.visit(ctx, data);
    expect(results.errors.length).to.equal(0);
  });

  itLeaks('should pick items from the root', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    });
    const rule = new SchemaRule({
      check: undefined,
      desc: TEST_NAME,
      level: 'info',
      name: TEST_NAME,
      select: '$.foo',
      tags: [],
    });
    const results = await rule.pick(ctx, {
      foo: [1, 2, 3],
    });
    expect(Array.isArray(results)).to.equal(true);
  });

  itLeaks('should visit selected items', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    });

    const check = {};
    const checkSpy = stub().returns(true);
    const filter = {};
    const filterSpy = stub().returns(true);
    ctx.compile = stub().onFirstCall().returns(checkSpy).onSecondCall().returns(filterSpy);

    const rule = new SchemaRule({
      check,
      desc: TEST_NAME,
      filter,
      level: 'info',
      name: TEST_NAME,
      select: '$.foo',
      tags: [],
    });

    const data = {};
    await rule.visit(ctx, data);

    expect(filterSpy, 'filter spy should have been called with data').to.have.callCount(1).and.been.calledWithExactly(data);
    expect(checkSpy, 'check spy should have been called with data').to.have.callCount(1).and.been.calledWithExactly(data);
  });

  itLeaks('should skip filtered items', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    });

    const checkSpy = stub().throws(new Error('check spy error'));
    const filterSpy = stub().returns(false);
    ctx.compile = stub().onFirstCall().returns(checkSpy).onSecondCall().returns(filterSpy);

    const rule = new SchemaRule({
      check: undefined,
      desc: TEST_NAME,
      filter: {},
      level: 'info',
      name: TEST_NAME,
      select: '$.foo',
      tags: [],
    });

    const data = {};
    await rule.visit(ctx, data);

    expect(filterSpy, 'filter spy should have been called with data').to.have.callCount(1).and.been.calledWithExactly(data);
    expect(checkSpy, 'check spy should not have been called').to.have.callCount(0);
  });
});

describe('friendly errors', () => {
  it('should have a message', () => {
    const rule = new SchemaRule({
      check: {},
      desc: TEST_NAME,
      level: 'info',
      name: TEST_NAME,
      select: '',
      tags: [TEST_NAME],
    });
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    });
    ctx.visitData = {
      itemIndex: 0,
      rule,
    };
    const err = friendlyError(ctx, {
      dataPath: 'test-path',
      keyword: TEST_NAME,
      params: { /* ? */ },
      schemaPath: 'test-path',
    });
    expect(err.msg).to.include(TEST_NAME);
  });

  it('should handle errors with an existing message', () => {
    const TEST_MESSAGE = 'test-message';
    const rule = new SchemaRule({
      check: {},
      desc: TEST_NAME,
      level: 'info',
      name: TEST_NAME,
      select: '',
      tags: [TEST_NAME],
    });
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: NullLogger.global,
    });
    ctx.visitData = {
      itemIndex: 0,
      rule,
    };
    const err = friendlyError(ctx, {
      dataPath: 'test-path',
      keyword: TEST_NAME,
      message: TEST_MESSAGE,
      params: { /* ? */ },
      schemaPath: 'test-path',
    });
    expect(err.msg).to.include(TEST_MESSAGE);
  });
});
