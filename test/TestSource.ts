import { expect } from 'chai';
import mockFs from 'mock-fs';
import { BaseError } from 'noicejs';
import { spy, stub } from 'sinon';
import { PassThrough } from 'stream';

import { readSource, writeSource } from '../src/source';
import { describeLeaks, itLeaks } from './helpers/async';

export const TEST_STRING = 'hello world';

describeLeaks('load source helper', async () => {
  itLeaks('should read from stdin', async () => {
    const pt = new PassThrough();

    const futureSource = readSource('-', pt);
    pt.emit('data', Buffer.from(TEST_STRING));
    pt.end();
    pt.destroy();

    const source = await futureSource;
    expect(source).to.equal(TEST_STRING);
  });

  it('should read from a file', async () => {
    mockFs({
      test: TEST_STRING,
    });

    const source = await readSource('test');
    mockFs.restore();

    expect(source).to.equal(TEST_STRING);
  });

  it('should handle errors reading from stdin', async () => {
    const pt = new PassThrough();
    const futureSource = readSource('-', pt);
    pt.emit('error', new BaseError('terribad!'));

    return expect(futureSource).to.eventually.be.rejectedWith(BaseError);
  });
});

describeLeaks('write source helper', async () => {
  it('should write to a file', async () => {
    mockFs({
      test: 'empty',
    });

    await writeSource('test', TEST_STRING);
    const source = await readSource('test');
    mockFs.restore();

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
