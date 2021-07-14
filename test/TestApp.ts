import { expect } from 'chai';
import { vol } from 'memfs';

import { main, STATUS_ERROR, STATUS_SUCCESS } from '../src/app';
import { Filesystem, readSource, setFs } from '../src/source';

const TEST_ARGS_PRE = ['node', 'test'];
const TEST_ARGS_CONFIG = ['--config-path', 'docs', '--config-name', 'config.yml'];
const TEST_ARGS_RULES = ['--rule-file', 'rules.yml', '--tag', 'test'];
const TEST_ARGS_SOURCE = ['--source', 'test.yml'];

const TEST_FILES = {
  './docs/config.yml': 'data: {logger: {level: debug, name: test, stream: !stream stderr}}',
  './docs/partial.yml': 'data: {logger: {name: test}}',
  './rules.yml': `{
    name: test,
    rules: [{
      name: test,
      desc: test-rule,
      level: info,
      tags: [test],
      check: {
        type: object,
        required: [foo],
        properties: {
          foo: {
            type: number,
            default: 4
          }
        }
      }
    }]
  }`,
  './test.yml': 'hello world',
};

describe('main app', async () => {
  beforeEach(() => {
    vol.reset();
  });

  it('completion should succeed', async () => {
    const status = await main(['node', 'test', 'complete']);
    expect(status).to.equal(STATUS_SUCCESS);
  });

  it('should list rules and exit', async () => {
    vol.fromJSON(TEST_FILES);
    const restore = setFs(vol.promises as Filesystem);

    const status = await main([
      ...TEST_ARGS_PRE,
      'list',
      ...TEST_ARGS_CONFIG,
    ]);

    restore();

    expect(status).to.equal(STATUS_SUCCESS);
  });

  it('should load the source', async () => {
    vol.fromJSON(TEST_FILES);
    const restore = setFs(vol.promises as Filesystem);

    const status = await main([
      ...TEST_ARGS_PRE,
      ...TEST_ARGS_CONFIG,
      ...TEST_ARGS_SOURCE,
    ]);

    restore();

    expect(status).to.equal(STATUS_SUCCESS);
  });

  it('should exit with rule errors', async () => {
    vol.fromJSON(TEST_FILES);
    const restore = setFs(vol.promises as Filesystem);

    const status = await main([
      ...TEST_ARGS_PRE,
      ...TEST_ARGS_CONFIG,
      ...TEST_ARGS_SOURCE,
      ...TEST_ARGS_RULES,
    ]);

    restore();

    expect(status).to.equal(STATUS_ERROR);
  });

  it('should exit with error count', async () => {
    vol.fromJSON(TEST_FILES);
    const restore = setFs(vol.promises as Filesystem);

    const status = await main([
      ...TEST_ARGS_PRE,
      ...TEST_ARGS_CONFIG,
      ...TEST_ARGS_SOURCE,
      ...TEST_ARGS_RULES,
      '--count',
    ]);

    restore();

    expect(status).to.equal(STATUS_ERROR);
  });

  it('should fix up partial documents', async () => {
    vol.fromJSON({
      ...TEST_FILES,
      'test.yml': '{}',
    });
    const restore = setFs(vol.promises as Filesystem);

    const status = await main([
      ...TEST_ARGS_PRE,
      'fix',
      ...TEST_ARGS_CONFIG,
      ...TEST_ARGS_SOURCE,
      ...TEST_ARGS_RULES,
      '--dest', 'test-dest',
    ]);
    const result = await readSource('test-dest');

    restore();

    expect(status).to.equal(STATUS_SUCCESS);
    expect(result).to.equal('foo: 4\n');
  });

  it('should validate config before running', async () => {
    vol.fromJSON(TEST_FILES);
    const restore = setFs(vol.promises as Filesystem);

    const [configPath, configDocs, configName] = TEST_ARGS_CONFIG;
    const status = await main([
      ...TEST_ARGS_PRE,
      configPath,
      configDocs,
      configName,
      'partial.yml',
      ...TEST_ARGS_RULES,
      ...TEST_ARGS_SOURCE,
    ]);

    restore();

    expect(status).to.equal(STATUS_ERROR);
  });
});
