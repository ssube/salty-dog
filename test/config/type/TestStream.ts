import { expect } from 'chai';

import { streamType } from '../../../src/config/type/Stream';
import { NotFoundError } from '../../../src/error/NotFoundError';
import { describeLeaks, itLeaks } from '../../helpers/async';

const TEST_STREAMS = [{
  name: 'stderr',
  stream: process.stderr,
}, {
  name: 'stdin',
  stream: process.stdin,
}, {
  name: 'stdout',
  stream: process.stdout,
}];

describeLeaks('stream config type', async () => {
  itLeaks('should resolve allowed streams', async () => {
    expect(streamType.resolve('stderr')).to.equal(true);
    expect(streamType.resolve('stdout')).to.equal(true);
  });

  itLeaks('should throw when stream is not allowed', async () => {
    expect(() => streamType.resolve('stdin')).to.throw(NotFoundError);
  });

  itLeaks('should throw when stream does not exist', async () => {
    expect(() => streamType.resolve('imaginary')).to.throw(NotFoundError);
  });

  itLeaks('should construct streams', async () => {
    for (const {name, stream} of TEST_STREAMS) {
      expect(streamType.construct(name)).to.equal(stream, `should construct stream ${name}`);
    }
  });
});

