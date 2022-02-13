import { expect } from 'chai';
import { LogLevel, NullLogger } from 'noicejs';
import { mock, spy, stub } from 'sinon';

import { RuleVisitor } from '../../src/visitor/RuleVisitor.js';
import { SchemaRule } from '../../src/rule/SchemaRule.js';
import { VisitorContext } from '../../src/visitor/VisitorContext.js';

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
    const data = {};
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

    const pickStub = mockRule.expects('pick').once().withArgs(ctx, data);
    pickStub.onFirstCall().returns(Promise.resolve([]));
    pickStub.throws();

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visit(ctx, rule, {});

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
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: LogLevel.Info,
      name: 'foo',
      select: '$',
      tags: [],
    });

    const mockRule = mock(rule);

    const pickStub = mockRule.expects('pick').once().withArgs(ctx, data);
    pickStub.onFirstCall().returns(Promise.resolve([data]));
    pickStub.throws();

    const visitStub = mockRule.expects('visit').once().withArgs(ctx, data);
    visitStub.onFirstCall().returns(Promise.resolve(ctx));
    visitStub.throws();

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visit(ctx, rule, {});

    mockRule.verify();
    expect(ctx.errors.length).to.equal(0);
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

    const pickSpy = spy(rule, 'pick');
    const visitStub = stub(rule, 'visit').returns(Promise.resolve({
      changes: [],
      errors: [],
    }));

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visit(ctx, rule, data);

    expect(pickSpy).to.have.callCount(1).and.to.have.been.calledWithExactly(ctx, data);
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
        data: {},
        level: LogLevel.Error,
        msg: 'kaboom!',
      }],
    }));

    const visitor = new RuleVisitor({
      rules: [rule],
    });
    await visitor.visit(ctx, rule, data);

    const EXPECTED_VISITS = 3;
    expect(visitStub).to.have.callCount(EXPECTED_VISITS);
    expect(ctx.errors.length).to.equal(EXPECTED_VISITS);
  });

  it('should not pick items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const visitor = new RuleVisitor({
      rules: [],
    });

    return expect(visitor.pick(ctx, rule, {})).to.eventually.deep.equal([]);
  });
});
