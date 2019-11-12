import { expect } from 'chai';
import { LogLevel, NullLogger } from 'noicejs';
import { mock, spy, stub } from 'sinon';

import { createRuleSelector, createRuleSources, resolveRules, visitRules } from '../../src/rule';
import { SchemaRule } from '../../src/rule/SchemaRule';
import { VisitorContext } from '../../src/visitor/VisitorContext';
import { describeLeaks, itLeaks } from '../helpers/async';

const TEST_RULES = [new SchemaRule({
  check: {},
  desc: '',
  level: LogLevel.Info,
  name: 'foo',
  select: '$',
  tags: ['all', 'foo'],
}), new SchemaRule({
  check: {},
  desc: '',
  level: LogLevel.Warn,
  name: 'bar',
  select: '$',
  tags: ['all', 'test'],
}), new SchemaRule({
  check: {},
  desc: '',
  level: LogLevel.Warn,
  name: 'bin',
  select: '$',
  tags: ['all', 'test'],
})];

describeLeaks('rule resolver', async () => {
  describeLeaks('include by level', async () => {
    itLeaks('should include info rules', async () => {
      const info = await resolveRules(TEST_RULES, createRuleSelector({
        includeLevel: [LogLevel.Info],
      }));

      expect(info.length).to.equal(1);
      expect(info[0]).to.equal(TEST_RULES[0]);
    });

    itLeaks('should include warn rules', async () => {
      const info = await resolveRules(TEST_RULES, createRuleSelector({
        includeLevel: [LogLevel.Warn],
      }));

      expect(info.length).to.equal(2);
      expect(info[0]).to.equal(TEST_RULES[1]);
      expect(info[1]).to.equal(TEST_RULES[2]);
    });
  });

  describeLeaks('include by name', async () => {
    itLeaks('should include foo rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        includeName: ['foo'],
      }));

      expect(rules.length).to.equal(1);
      expect(rules[0].name).to.equal('foo');
    });
  });

  describeLeaks('include by tag', async () => {
    itLeaks('should include test rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        includeTag: ['test'],
      }));

      expect(rules.length).to.equal(2);
      expect(rules[0]).to.equal(TEST_RULES[1]);
      expect(rules[1]).to.equal(TEST_RULES[2]);
    });
  });

  describeLeaks('exclude by name', async () => {
    itLeaks('should exclude foo rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        excludeName: ['foo'],
        includeTag: ['all'],
      }));

      expect(rules.length).to.equal(2);
      expect(rules[0]).to.equal(TEST_RULES[1]);
      expect(rules[1]).to.equal(TEST_RULES[2]);
    });
  });

  describeLeaks('exclude by tag', async () => {
    itLeaks('should exclude test rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        excludeTag: ['test'],
        includeTag: ['all'],
      }));

      expect(rules.length).to.equal(1);
      expect(rules[0]).to.equal(TEST_RULES[0]);
    });
  });
});

describeLeaks('rule visitor', async () => {
  itLeaks('should only call visit for selected items', async () => {
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

    await visitRules(ctx, [rule], {});

    mockRule.verify();
    expect(ctx.errors.length).to.equal(0);
  });

  itLeaks('should call visit for each selected item', async () => {
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

    await visitRules(ctx, [rule], {});

    mockRule.verify();
    expect(ctx.errors.length).to.equal(0);
  });

  itLeaks('should visit individual items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const data = {
      foo: [1, 2, 3],
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

    await visitRules(ctx, [rule], data);

    expect(pickSpy).to.have.callCount(1).and.to.have.been.calledWithExactly(ctx, data);
    expect(visitStub).to.have.callCount(3);
  });

  itLeaks('should visit individual items', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const data = {
      foo: [1, 2, 3],
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

    await visitRules(ctx, [rule], data);

    expect(visitStub).to.have.callCount(3);
    expect(ctx.errors.length).to.equal(3);
  });
});

describe('create rule sources helper', () => {
  it('should ensure every field is an array', () => {
    const sources = createRuleSources({});

    expect(sources).to.have.deep.property('ruleFile', []);
    expect(sources).to.have.deep.property('ruleModule', []);
    expect(sources).to.have.deep.property('rulePath', []);
  });
});

describe('create rule selector helper', () => {
  it('should ensure every field is an array', () => {
    const sources = createRuleSelector({});

    expect(sources).to.have.deep.property('excludeLevel', []);
    expect(sources).to.have.deep.property('excludeName', []);
    expect(sources).to.have.deep.property('excludeTag', []);
    expect(sources).to.have.deep.property('includeLevel', []);
    expect(sources).to.have.deep.property('includeName', []);
    expect(sources).to.have.deep.property('includeTag', []);
  });
});
