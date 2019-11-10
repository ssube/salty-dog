import { expect } from 'chai';

import { main, STATUS_SUCCESS } from '../src/app';
import { describeLeaks } from './helpers/async';

describeLeaks('main app', async () => {
  xit('completion should succeed', async () => {
    const status = await main(['node', 'test', 'complete']);
    expect(status).to.equal(STATUS_SUCCESS);
  });
});
