import { expect } from 'chai';
import { LogLevel, NullLogger } from 'noicejs';
import { stub } from 'sinon';

import { friendlyError, SchemaRule } from '../../src/rule/SchemaRule.js';
import { VisitorContext } from '../../src/visitor/VisitorContext.js';
import { createErrorContext, makeDocument, makeElement } from '../helpers.js';

/* eslint-disable @typescript-eslint/unbound-method */

const TEST_NAME = 'test-rule';

describe('schema rule', async () => {
  it('should pick items from the scope', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const data = {
      foo: 3,
    };
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: LogLevel.Info,
      name: 'foo',
      select: '$.foo',
      tags: [],
    });
    const results = await rule.pick(ctx, makeDocument(data));

    expect(results.map(r => r.data)).to.deep.equal([data.foo]);
  });

  it('should pick no items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const data = {
      bar: 3,
    };
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: LogLevel.Info,
      name: 'foo',
      select: '$.foo',
      tags: [],
    });
    const results = await rule.pick(ctx, makeDocument(data));

    expect(results).to.deep.equal([]);
  });

  it('should filter out items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
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
      level: LogLevel.Info,
      name: 'foo',
      select: '$.foo',
      tags: [],
    });

    const results = await rule.visit(ctx, makeElement(data));
    expect(results.errors.length).to.equal(0);
  });

  it('should pick items from the root', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const rule = new SchemaRule({
      check: {}, // TODO: used to be undefined, what should this be now?
      desc: TEST_NAME,
      level: LogLevel.Info,
      name: TEST_NAME,
      select: '$.foo',
      tags: [],
    });
    const results = await rule.pick(ctx, makeDocument({
      foo: [Math.random(), Math.random(), Math.random()],
    }));
    expect(Array.isArray(results)).to.equal(true);
  });

  it('should visit selected items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const data = {};
    const elem = makeElement(data);

    const check = {};
    const checkSpy = stub().returns(true);
    const filter = {};
    const filterSpy = stub().returns(true);
    ctx.compile = stub().onFirstCall().returns(filterSpy).onSecondCall().returns(checkSpy);

    const rule = new SchemaRule({
      check,
      desc: TEST_NAME,
      filter,
      level: LogLevel.Info,
      name: TEST_NAME,
      select: '$.foo',
      tags: [],
    });

    await rule.visit(ctx, elem);

    expect(filterSpy, 'filter spy should have been called with data').to.have.callCount(1); //.and.been.calledWith(elem);
    expect(checkSpy, 'check spy should have been called with data').to.have.callCount(1); //.and.been.calledWith(elem);
  });

  it('should skip filtered items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const checkSpy = stub().throws(new Error('check spy error'));
    const filterSpy = stub().returns(false);
    ctx.compile = stub().onFirstCall().returns(filterSpy).onSecondCall().returns(checkSpy);

    const rule = new SchemaRule({
      check: {}, // TODO: used to be undefined, what should this be now?
      desc: TEST_NAME,
      filter: {},
      level: LogLevel.Info,
      name: TEST_NAME,
      select: '$.foo',
      tags: [],
    });

    const data = {};
    const elem = makeElement(data);
    await rule.visit(ctx, elem);

    expect(filterSpy, 'filter spy should have been called with data').to.have.callCount(1); //.and.been.calledWithMatch(elem);
    expect(checkSpy, 'check spy should not have been called').to.have.callCount(0);
  });
});

describe('friendly errors', () => {
  it('should have a message', async () => {
    const { ctx, rule } = createErrorContext(TEST_NAME);
    const err = friendlyError(ctx, {
      instancePath: 'test-path',
      keyword: TEST_NAME,
      params: { /* ? */ },
      schemaPath: 'test-path',
    }, makeElement({}), rule);
    expect(err.msg).to.include(TEST_NAME);
  });

  it('should handle errors with an existing message', async () => {
    const { ctx, rule } = createErrorContext(TEST_NAME);
    const TEST_MESSAGE = 'test-message';
    const err = friendlyError(ctx, {
      instancePath: 'test-path',
      keyword: TEST_NAME,
      message: TEST_MESSAGE,
      params: { /* ? */ },
      schemaPath: 'test-path',
    }, makeElement({}), rule);
    expect(err.msg).to.include(TEST_MESSAGE);
  });
});
