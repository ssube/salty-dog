import { expect } from 'chai';
import { LogLevel, NullLogger } from 'noicejs';
import { mock, spy, stub } from 'sinon';

import { SchemaRule } from '../../src/rule/SchemaRule.js';
import { RuleVisitor } from '../../src/visitor/RuleVisitor.js';
import { VisitorContext } from '../../src/visitor/VisitorContext.js';
import { makeDocument, makeElement } from '../helpers.js';

describe('rule visitor', async () => {
  it('should only call visit for selected items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const doc = makeDocument({});
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: LogLevel.Info,
      name: 'foo',
      select: '$',
      tags: [],
    });

    const mockRule = mock(rule);
    mockRule.expects('visit').never();

    const pickStub = mockRule.expects('pick').once().withArgs(ctx, doc);
    pickStub.onFirstCall().returns(Promise.resolve([]));
    pickStub.throws();

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visitAll(ctx, rule, doc);

    mockRule.verify();
    expect(ctx.errors.length).to.equal(0);
  });

  it('should call visit for each selected item', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const data = {};
    const doc = makeDocument({});
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: LogLevel.Info,
      name: 'foo',
      select: '$',
      tags: [],
    });

    const mockRule = mock(rule);

    const pickStub = mockRule.expects('pick').once().withArgs(ctx, doc);
    pickStub.onFirstCall().returns(Promise.resolve([data]));
    pickStub.throws();

    const visitStub = mockRule.expects('visit').once().withArgs(ctx, data);
    visitStub.onFirstCall().returns(Promise.resolve(ctx));
    visitStub.throws();

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visitAll(ctx, rule, doc);

    mockRule.verify();
    expect(ctx.errors.length).to.equal(0);
  });

  it('should invoke the rule pick and visit', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const data = {
      foo: [Math.random(), Math.random(), Math.random()],
    };
    const doc = makeDocument(data);

    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: LogLevel.Info,
      name: 'foo',
      select: '$.foo.*',
      tags: [],
    });

    const pickSpy = spy(rule, 'pick');
    const visitStub = stub(rule, 'visit').returns(Promise.resolve({
      changes: [],
      errors: [],
      rule,
    }));

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visitAll(ctx, rule, doc);

    expect(pickSpy).to.have.callCount(1).and.to.have.been.calledWithExactly(ctx, doc);
    expect(visitStub).to.have.callCount(data.foo.length);
  });

  it('should visit individual items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const data = {
      foo: [Math.random(), Math.random(), Math.random()],
    };
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: LogLevel.Info,
      name: 'foo',
      select: '$.foo.*',
      tags: [],
    });

    const visitStub = stub(rule, 'visit').returns(Promise.resolve({
      changes: [],
      errors: [{
        data: makeElement({}),
        err: {} as any,
        level: LogLevel.Error,
        msg: 'kaboom!',
        rule,
      }],
      rule,
    }));

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visitAll(ctx, rule, makeDocument(data));

    const EXPECTED_VISITS = 3;
    expect(visitStub).to.have.callCount(EXPECTED_VISITS);
    expect(ctx.errors.length).to.equal(EXPECTED_VISITS);
  });
});
