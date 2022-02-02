import { expect } from 'chai';
import { vol } from 'memfs';
import { BaseError } from 'noicejs';
import { spy, stub } from 'sinon';
import { PassThrough } from 'stream';

import { Filesystem, readSource, setFs, writeSource } from '../src/source.js';

export const TEST_STRING = 'hello world';

describe('load source helper', async () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should read from stdin', async () => {
    const pt = new PassThrough();

    const futureSource = readSource('-', pt);
    pt.emit('data', Buffer.from(TEST_STRING));
    pt.end();
    pt.destroy();

    const source = await futureSource;
    expect(source).to.equal(TEST_STRING);
  });

  it('should read from a file', async () => {
    vol.fromJSON({
      test: TEST_STRING,
    });

    const restore = setFs(vol.promises as Filesystem);

    const source = await readSource('test');

    restore();

    expect(source).to.equal(TEST_STRING);
  });

  it('should handle errors reading from stdin', async () => {
    const pt = new PassThrough();
    const futureSource = readSource('-', pt);
    pt.emit('error', new BaseError('terribad!'));

    return expect(futureSource).to.eventually.be.rejectedWith(BaseError);
  });
});

describe('write source helper', async () => {
  it('should write to a file', async () => {
    vol.fromJSON({
      test: 'empty',
    });

    const restore = setFs(vol.promises as Filesystem);

    await writeSource('test', TEST_STRING);
    const source = await readSource('test');

    restore();

    expect(source).to.equal(TEST_STRING);
  });

  it('should write to stdout', async () => {
    const pt = new PassThrough();
    const writeSpy = spy(pt, 'write');

    await writeSource('-', TEST_STRING, pt);
    pt.end();
    pt.destroy();

    expect(writeSpy).to.have.been.calledWith(TEST_STRING);
  });

  it('should handle errors writing to stdout', async () => {
    const pt = new PassThrough();
    stub(pt, 'write').yields(new BaseError('terribad!'));

    return expect(writeSource('-', 'test', pt)).to.eventually.be.rejectedWith(BaseError);
  });
});
