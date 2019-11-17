import { expect } from 'chai';
import { join } from 'path';

import { loadConfig, readConfig } from '../../src/config';
import { NotFoundError } from '../../src/error/NotFoundError';
import { describeLeaks, itLeaks } from '../helpers/async';

describeLeaks('load config helper', async () => {
  itLeaks('should load an existing config', async () => {
    const config = await loadConfig('config-stderr.yml', join(__dirname, '..', 'docs'));
    expect(config.data.logger.name).to.equal('salty-dog');
  });

  itLeaks('should throw when config is missing', async () =>
    expect(loadConfig('missing.yml', join(__dirname, '..', 'docs'))).to.eventually.be.rejectedWith(NotFoundError)
  );
});

describeLeaks('read config helper', async () => {
  itLeaks('should consume enoent errors', async () =>
    expect(readConfig(join('docs', 'missing.yml'))).to.eventually.equal(undefined)
  );

  itLeaks('should rethrow unknown errors', async () =>
    expect(readConfig('test')).to.eventually.be.rejectedWith(Error)
  );
});
