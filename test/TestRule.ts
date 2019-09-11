import { expect } from 'chai';
import { ConsoleLogger } from 'noicejs';
import { mock } from 'sinon';

import { makeSelector, resolveRules, Rule, visitRules } from '../src/rule';
import { VisitorContext } from '../src/visitor/VisitorContext';

const TEST_RULES = [new Rule({
  check: {},
  desc: '',
  level: 'info',
  name: 'foo',
  select: '$',
  tags: ['all', 'foo'],
}), new Rule({
  check: {},
  desc: '',
  level: 'warn',
  name: 'bar',
  select: '$',
  tags: ['all', 'test'],
}), new Rule({
  check: {},
  desc: '',
  level: 'warn',
  name: 'bin',
  select: '$',
  tags: ['all', 'test'],
})];

describe('rule resolver', () => {
  describe('include by level', () => {
    it('should include info rules', async () => {
      const info = await resolveRules(TEST_RULES, makeSelector({
        includeLevel: ['info'],
      }));

      expect(info.length).to.equal(1);
      expect(info[0]).to.equal(TEST_RULES[0]);
    });

    it('should include warn rules', async () => {
      const info = await resolveRules(TEST_RULES, makeSelector({
        includeLevel: ['warn'],
      }));

      expect(info.length).to.equal(2);
      expect(info[0]).to.equal(TEST_RULES[1]);
      expect(info[1]).to.equal(TEST_RULES[2]);
    });
  });

  describe('include by name', () => {
    it('should include foo rules', async () => {
      const rules = await resolveRules(TEST_RULES, makeSelector({
        includeName: ['foo'],
      }));

      expect(rules.length).to.equal(1);
      expect(rules[0].name).to.equal('foo');
    });
  });

  describe('include by tag', () => {
    it('should include test rules', async () => {
      const rules = await resolveRules(TEST_RULES, makeSelector({
        includeTag: ['test'],
      }));

      expect(rules.length).to.equal(2);
      expect(rules[0]).to.equal(TEST_RULES[1]);
      expect(rules[1]).to.equal(TEST_RULES[2]);
    });
  });

  describe('exclude by name', () => {
    it('should exclude foo rules', async () => {
      const rules = await resolveRules(TEST_RULES, makeSelector({
        excludeName: ['foo'],
        includeTag: ['all'],
      }));

      expect(rules.length).to.equal(2);
      expect(rules[0]).to.equal(TEST_RULES[1]);
      expect(rules[1]).to.equal(TEST_RULES[2]);
    });
  });

  describe('exclude by tag', () => {
    it('should exclude test rules', async () => {
      const rules = await resolveRules(TEST_RULES, makeSelector({
        excludeTag: ['test'],
        includeTag: ['all'],
      }));

      expect(rules.length).to.equal(1);
      expect(rules[0]).to.equal(TEST_RULES[0]);
    });
  });
});

describe('rule visitor', () => {
  it('should only call visit for selected items', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: new ConsoleLogger(),
    });
    const data = {};
    const rule = new Rule({
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

  it('should call visit for each selected item', async () => {
    const ctx = new VisitorContext({
      innerOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
      logger: new ConsoleLogger(),
    });
    const data = {};
    const rule = new Rule({
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
});
