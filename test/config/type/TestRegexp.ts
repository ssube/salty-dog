import { expect } from 'chai';

import { regexpType } from '../../../src/config/type/Regexp';
import { InvalidArgumentError } from '../../../src/error/InvalidArgumentError';
import { describeLeaks, itLeaks } from '../../helpers/async';

describeLeaks('regexp config type', async () => {
  itLeaks('match slashed strings', async () => {
    expect(regexpType.resolve('/foo/')).to.equal(true);
  });

  itLeaks('should match flags', async () => {
    const regexp: RegExp = regexpType.construct('/foo/g');
    expect(regexp.flags).to.equal('g');
  });

  itLeaks('should not match bare strings', async () => {
    expect(regexpType.resolve('foo')).to.equal(false);
  });

  itLeaks('should not match invalid flags', async () => {
    expect(regexpType.resolve('/foo/notrealflags')).to.equal(false);
  });

  itLeaks('should not match regexp embedded in a longer string', async () => {
    expect(regexpType.resolve('some/regexp/with-padding')).to.equal(false);
  });

  itLeaks('should throw when constructing an invalid regexp', async () => {
    expect(() => regexpType.construct('/foo/notrealflags')).to.throw(InvalidArgumentError);
  });
});
