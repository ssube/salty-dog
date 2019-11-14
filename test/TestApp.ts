import { expect } from 'chai';
import mockFs from 'mock-fs';

import { main, STATUS_SUCCESS } from '../src/app';
import { describeLeaks, itLeaks } from './helpers/async';

describeLeaks('main app', async () => {
  itLeaks('completion should succeed', async () => {
    const status = await main(['node', 'test', 'complete']);
    expect(status).to.equal(STATUS_SUCCESS);
  });

  itLeaks('should list rules and exit', async () => {
    mockFs({
      docs: {
        'config.yml': 'data: {logger: {level: debug, name: test, stream: !stream stderr}}',
      },
    });

    const status = await main([
      'node', 'test', 'list',
      '--config-path', 'docs',
      '--config-name', 'config.yml',
    ]);

    mockFs.restore();

    expect(status).to.equal(STATUS_SUCCESS);
  });

  itLeaks('should load the source', async () => {
    mockFs({
      'docs': {
        'config.yml': 'data: {logger: {level: debug, name: test, stream: !stream stderr}}',
      },
      'test.yml': 'hello world',
    });

    const status = await main([
      'node', 'test',
      '--config-path', 'docs',
      '--config-name', 'config.yml',
      '--source', 'test.yml',
    ]);

    mockFs.restore();

    expect(status).to.equal(STATUS_SUCCESS);
  });
});
