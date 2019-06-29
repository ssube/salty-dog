import { expect } from 'chai';
import { Rule, resolveRules, makeSelector } from 'src/rule';

const TEST_RULES = [new Rule({
  name: 'foo',
  desc: '',
  level: 'info',
  tags: ['all', 'foo'],
  check: {},
  select: '$',
}), new Rule({
  name: 'bar',
  desc: '',
  level: 'warn',
  tags: ['all', 'test'],
  check: {},
  select: '$',
}), new Rule({
  name: 'bin',
  desc: '',
  level: 'warn',
  tags: ['all', 'test'],
  check: {},
  select: '$',
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
