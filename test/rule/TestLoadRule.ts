import { expect } from 'chai';
import { vol } from 'memfs';
import { LogLevel, NullLogger } from 'noicejs';
import { spy, stub } from 'sinon';

import { dirName } from '../../src/config/index.js';
import { loadRuleFiles, loadRuleModules, loadRulePaths, loadRuleSource } from '../../src/rule/load.js';
import { SchemaRule } from '../../src/rule/SchemaRule.js';
import { Filesystem, setFs } from '../../src/source.js';
import { VisitorContext } from '../../src/visitor/VisitorContext.js';

const __dirname = dirName();

const EXAMPLE_EMPTY = '{name: foo, definitions: {}, rules: []}';
const EXAMPLE_RULES = `{
  name: foo,
  definitions: {},
  rules: [{
    name: test,
    desc: test-rule,
    level: info,
    tags: [],
    check: {}
  }]
}`;

function testContext() {
  return new VisitorContext({
    logger: NullLogger.global,
    schemaOptions: {
      coerce: false,
      defaults: false,
      mutate: false,
    },
  });
}

describe('load rule file helper', async () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should add schema', async () => {
    vol.fromJSON({
      test: EXAMPLE_EMPTY,
    });
    const restore = setFs(vol.promises as Filesystem);

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

    restore();

    expect(schemaSpy).to.have.been.calledWith('foo');
    expect(rules.length).to.equal(0);
  });

  it('should load rules', async () => {
    vol.fromJSON({
      test: EXAMPLE_RULES,
    });
    const restore = setFs(vol.promises as Filesystem);

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

    restore();

    expect(rules.length).to.equal(1);
  });

  it('should validate rule files', async () => {
    vol.fromJSON({
      test: `{
        name: foo,
        definitions: [],
        rules: {}
      }`
    });
    const restore = setFs(vol.promises as Filesystem);

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

    restore();

    expect(rules.length).to.equal(0);
  });
});

describe('load rule path helper', async () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should only load matching rule files', async () => {
    vol.fromJSON({
      // eslint-disable-next-line
      'test': null,
      'test/bin.nope': '{}', // will parse but throw on lack of rules
      'test/foo.yml': EXAMPLE_RULES,
    }, __dirname);
    const restore = setFs(vol.promises as Filesystem);

    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const rules = await loadRulePaths([
      `${__dirname}/test`,
    ], ctx);

    restore();

    expect(rules.length).to.equal(1);
  });

  it('should recursively load rule files', async () => {
    vol.fromJSON({
      // eslint-disable-next-line
      'test': null,
      'test/bar-dir/bar.yml': EXAMPLE_RULES.replace(/foo/g, 'bar'),
      'test/bin.nope': '{}', // will parse but throw on lack of rules
      'test/some-dir/foo.yml': EXAMPLE_RULES,
    }, __dirname);
    const restore = setFs(vol.promises as Filesystem);

    const ctx = new VisitorContext({
      logger: NullLogger.global,
      schemaOptions: {
        coerce: false,
        defaults: false,
        mutate: false,
      },
    });

    const rules = await loadRulePaths([
      `${__dirname}/test`,
    ], ctx);

    restore();

    const EXPECTED_RULES = 2;
    expect(rules.length).to.equal(EXPECTED_RULES);
  });
});

describe('load rule module helper', async () => {
  it('should load rule modules', async () => {
    const ctx = testContext();
    const requireStub = stub().withArgs('test').returns({
      name: 'test',
      rules: [{
        check: {},
        desc: 'testing rule',
        level: 'info',
        name: 'test-rule',
        tags: [],
      }],
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    }) as any;
    const rules = await loadRuleModules(['test'], ctx, requireStub);
    expect(rules.length).to.equal(1);
  });

  it('should handle errors loading rule modules', async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const requireStub = stub().throws(new Error('could not load this module')) as any;
    const ctx = testContext();

    return expect(loadRuleModules(['test'], ctx, requireStub)).to.eventually.deep.equal([]);
  });

  it('should validate rule module exports', async () => {
    const requireStub = stub().returns({
      name: 'test-rules',
      rules: {},
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    }) as any;
    const ctx = testContext();

    return expect(loadRuleModules(['test'], ctx, requireStub)).to.eventually.deep.equal([]);
  });

  it('should load module definitions', async () => {
    const requireStub = stub().returns({
      definitions: {
        foo: {
          type: 'string',
        },
      },
      name: 'test-rules',
      rules: [],
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    }) as any;
    const ctx = testContext();

    await loadRuleModules(['test'], ctx, requireStub);
    const schema = ctx.compile({
      $ref: 'test-rules#/definitions/foo',
    });

    const NUMBER_VALUE = 2;
    expect(schema(NUMBER_VALUE)).to.equal(false);
    expect(schema('foo')).to.equal(true);
  });

  it('should not instantiate class instances', async () => {
    class TestRule extends SchemaRule { }
    const ctx = testContext();

    const rules = await loadRuleSource({
      name: 'test',
      rules: [new TestRule({
        check: {},
        desc: 'test',
        level: LogLevel.Info,
        name: 'test',
        select: '$',
        tags: [],
      })],
    }, ctx);
    expect(rules[0]).to.be.an.instanceOf(TestRule);
  });
});
