import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { join } from 'path';

import { dirName, loadConfig, readConfig } from '../../src/config/index.js';

const __dirname = dirName();

describe('load config helper', async () => {
  it('should load an existing config', async () =>
    expect(loadConfig('config-stderr.yml', join(__dirname, 'docs'))).to.eventually.deep.include({
      data: {
        logger: {
          level: 'debug',
          name: 'salty-dog',
          stream: process.stderr,
        },
      },
    })
  );

  it('should throw when config is missing', async () =>
    expect(loadConfig('missing.yml', join(__dirname, 'docs'))).to.eventually.be.rejectedWith(NotFoundError)
  );

  it('should load included config', async () =>
    expect(loadConfig('config-include.yml', join(__dirname, 'docs'))).to.eventually.deep.include({
      data: {
        include: {
          foo: 'bar',
        },
      },
    })
  );
});

describe('read config helper', async () => {
  it('should consume enoent errors', async () =>
    expect(readConfig(join('docs', 'missing.yml'))).to.eventually.equal(undefined)
  );

  it('should rethrow unknown errors', async () =>
    expect(readConfig('test')).to.eventually.be.rejectedWith(Error)
  );
});
