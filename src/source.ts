import { readdir, readFile as readBack, writeFile as writeBack } from 'fs';
import { isNil } from 'lodash';
import { promisify } from 'util';

export const FILE_ENCODING = 'utf-8';

export const readDir = promisify(readdir);
export const readFile = promisify(readBack);
export const writeFile = promisify(writeBack);

export async function readSource(path: string, stream = process.stdin): Promise<string> {
  if (path === '-') {
    return readStream(stream, FILE_ENCODING);
  } else {
    return readFile(path, {
      encoding: FILE_ENCODING,
    });
  }
}

export function readStream(stream: NodeJS.ReadStream, encoding: string): Promise<string> {
  return new Promise((res, rej) => {
    const chunks: Array<Buffer> = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => {
      const result = Buffer.concat(chunks).toString(encoding);
      res(result);
    });
    stream.on('error', (err) => rej(err));
  });
}

export async function writeSource(path: string, data: string, stream = process.stdout): Promise<void> {
  if (path === '-') {
    return writeStream(stream, data);
  } else {
    return writeFile(path, data, {
      encoding: FILE_ENCODING,
    });
  }
}

export function writeStream(stream: NodeJS.WriteStream, data: string): Promise<void> {
  return new Promise((res, rej) => {
    /* eslint-disable-next-line @typescript-eslint/ban-types */
    stream.write(data, (err: Error | null | undefined) => {
      if (isNil(err)) {
        res();
      } else {
        rej(err);
      }
    });
  });
}
