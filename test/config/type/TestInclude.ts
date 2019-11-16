import { expect } from 'chai';
import { BaseError } from 'noicejs';
import { join } from 'path';

import { includeType, resolvePath } from '../../../src/config/type/Include';
import { NotFoundError } from '../../../src/error/NotFoundError';
import { describeLeaks, itLeaks } from '../../helpers/async';

const TEST_ROOT = '../test/config/type';
const CONFIG_MISSING = 'missing.yml';

describeLeaks('include config type', async () => {
  itLeaks('should resolve existing files', async () => {
    expect(includeType.resolve(join(TEST_ROOT, 'include.yml'))).to.equal(true);
  });

  itLeaks('should throw when resolving missing files', async () => {
    expect(() => {
      includeType.resolve(join(TEST_ROOT, CONFIG_MISSING));
    }).to.throw(NotFoundError);
  });

  itLeaks('should construct data from file', async () => {
    expect(includeType.construct(join(TEST_ROOT, 'include.yml'))).to.equal('test');
  });

  itLeaks('should throw when constructing missing files', async () => {
    expect(() => {
      includeType.construct(join(TEST_ROOT, CONFIG_MISSING));
    }).to.throw(BaseError);
  });

  itLeaks('should throw when resolving missing files', async () => {
    expect(() => {
      includeType.resolve(join(TEST_ROOT, CONFIG_MISSING));
    }).to.throw(BaseError);
  });
});

describeLeaks('resolve path helper', async () => {
  itLeaks('should resolve relative paths relative to dirname', async () => {
    expect(resolvePath('./index.js')).to.equal(join(__dirname, 'index.js'));
  });

  itLeaks('should resolve absolute paths to themselves', async () => {
    expect(resolvePath('/')).to.equal('/');
  });
});
