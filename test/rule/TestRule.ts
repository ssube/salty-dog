import { expect } from 'chai';
import { ConsoleLogger } from 'noicejs';
import { mock, spy } from 'sinon';

import { createRuleSelector, resolveRules, visitRules } from '../../src/rule';
import { SchemaRule } from '../../src/rule/SchemaRule';
import { VisitorContext } from '../../src/visitor/VisitorContext';
import { describeLeaks, itLeaks } from '../helpers/async';

const TEST_RULES = [new SchemaRule({
  check: {},
  desc: '',
  level: 'info',
  name: 'foo',
  select: '$',
  tags: ['all', 'foo'],
}), new SchemaRule({
  check: {},
  desc: '',
  level: 'warn',
  name: 'bar',
  select: '$',
  tags: ['all', 'test'],
}), new SchemaRule({
  check: {},
  desc: '',
  level: 'warn',
  name: 'bin',
  select: '$',
  tags: ['all', 'test'],
})];

describeLeaks('rule resolver', async () => {
  describeLeaks('include by level', async () => {
    itLeaks('should include info rules', async () => {
      const info = await resolveRules(TEST_RULES, createRuleSelector({
        includeLevel: ['info'],
      }));

      expect(info.length).to.equal(1);
      expect(info[0]).to.equal(TEST_RULES[0]);
    });

    itLeaks('should include warn rules', async () => {
      const info = await resolveRules(TEST_RULES, createRuleSelector({
        includeLevel: ['warn'],
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
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: new ConsoleLogger(),
    });
    const data = {};
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: 'info',
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
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: new ConsoleLogger(),
    });
    const data = {};
    const rule = new SchemaRule({
      check: {},
      desc: '',
      level: 'info',
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

  itLeaks('should pick items from the scope', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: new ConsoleLogger(),
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
      logger: new ConsoleLogger(),
    });
    const errorSpy = spy(ctx, 'error');

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
    expect(errorSpy).to.have.callCount(0);
  });
});
