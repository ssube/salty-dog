import { expect } from 'chai';
import { ConsoleLogger, LogLevel, NullLogger } from 'noicejs';

import { createRuleSelector, createRuleSources, resolveRules, validateRules } from '../../src/rule';
import { SchemaRule } from '../../src/rule/SchemaRule';
import { VisitorContext } from '../../src/visitor/VisitorContext';

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

describe('rule resolver', async () => {
  describe('include by level', async () => {
    it('should include info rules', async () => {
      const info = await resolveRules(TEST_RULES, createRuleSelector({
        includeLevel: [LogLevel.Info],
      }));

      expect(info.length).to.equal(1);
      expect(info[0]).to.equal(TEST_RULES[0]);
    });

    it('should include warn rules', async () => {
      const info = await resolveRules(TEST_RULES, createRuleSelector({
        includeLevel: [LogLevel.Warn],
      }));

      const EXPECTED_RULES = 2;
      expect(info.length).to.equal(EXPECTED_RULES);
      expect(info[0]).to.equal(TEST_RULES[1]);
      /* eslint-disable-next-line no-magic-numbers */
      expect(info[1]).to.equal(TEST_RULES[2]);
    });
  });

  describe('include by name', async () => {
    it('should include foo rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        includeName: ['foo'],
      }));

      expect(rules.length).to.equal(1);
      expect(rules[0].name).to.equal('foo');
    });
  });

  describe('include by tag', async () => {
    it('should include test rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        includeTag: ['test'],
      }));

      const EXPECTED_RULES = 2;
      expect(rules.length).to.equal(EXPECTED_RULES);
      expect(rules[0]).to.equal(TEST_RULES[1]);
      /* eslint-disable-next-line no-magic-numbers */
      expect(rules[1]).to.equal(TEST_RULES[2]);
    });
  });

  describe('exclude by name', async () => {
    it('should exclude foo rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        excludeName: ['foo'],
        includeTag: ['all'],
      }));

      const EXPECTED_RULES = 2;
      expect(rules.length).to.equal(EXPECTED_RULES);
      expect(rules[0]).to.equal(TEST_RULES[1]);
      /* eslint-disable-next-line no-magic-numbers */
      expect(rules[1]).to.equal(TEST_RULES[2]);
    });
  });

  describe('exclude by tag', async () => {
    it('should exclude test rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        excludeTag: ['test'],
        includeTag: ['all'],
      }));

      expect(rules.length).to.equal(1);
      expect(rules[0]).to.equal(TEST_RULES[0]);
    });
  });

  describe('exclude by level', async () => {
    it('should exclude warn rules', async () => {
      const rules = await resolveRules(TEST_RULES, createRuleSelector({
        excludeLevel: [LogLevel.Warn],
        includeTag: ['all'],
      }));

      expect(rules.length).to.equal(1);
      expect(rules[0]).to.equal(TEST_RULES[0]);
    });
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

describe('validate rule helper', async () => {
  it('should accept valid modules', async () => {
    const ctx = new VisitorContext({
      logger: ConsoleLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    expect(validateRules(ctx, {
      name: 'test',
      rules: [],
    })).to.equal(true);
  });

  it('should reject partial modules', async () => {
    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    expect(validateRules(ctx, {})).to.equal(false);
    expect(validateRules(ctx, {
      name: '',
    })).to.equal(false);
  });
});
