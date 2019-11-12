import { expect } from 'chai';
import mockFS from 'mock-fs';
import { NullLogger } from 'noicejs';
import { spy } from 'sinon';

import { loadRuleFiles, loadRulePaths } from '../../src/rule';
import { VisitorContext } from '../../src/visitor/VisitorContext';
import { describeLeaks, itLeaks } from '../helpers/async';

const EXAMPLE_EMPTY = '{name: foo, definitions: {}, rules: []}';
const EXAMPLE_RULES = `{
  name: foo,
  definitions: {},
  rules: [{
    name: test,
    level: info,
    tags: []
  }]
}`;

describeLeaks('load rule file helper', async () => {
  itLeaks('should add schema', async () => {
    mockFS({
      test: EXAMPLE_EMPTY,
    });

    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });
    const schemaSpy = spy(ctx, 'addSchema');

    const rules = await loadRuleFiles([
      'test',
    ], ctx);

    mockFS.restore();

    expect(schemaSpy).to.have.been.calledWith('foo');
    expect(rules.length).to.equal(0);
  });

  itLeaks('should load rules', async () => {
    mockFS({
      test: EXAMPLE_RULES,
    });

    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const rules = await loadRuleFiles([
      'test',
    ], ctx);

    mockFS.restore();

    expect(rules.length).to.equal(1);
  });
});

describeLeaks('load rule path helper', async () => {
  itLeaks('should only load matching rule files', async () => {
    mockFS({
      test: {
        'bin.nope': '{}', // will parse but throw on lack of rules
        'foo.yml': EXAMPLE_RULES,
      },
    });

    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const rules = await loadRulePaths([
      'test',
    ], ctx);

    mockFS.restore();

    expect(rules.length).to.equal(1);
  });

  itLeaks('should recursively load rule files', async () => {
    mockFS({
      test: {
        'bar-dir': {
          'bar.yml': EXAMPLE_RULES.replace(/foo/g, 'bar'),
        },
        'bin.nope': '{}', // will parse but throw on lack of rules
        'some-dir': {
          'foo.yml': EXAMPLE_RULES,
        },
      },
    });

    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const rules = await loadRulePaths([
      'test',
    ], ctx);

    mockFS.restore();

    expect(rules.length).to.equal(2);
  });
});
