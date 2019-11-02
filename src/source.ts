import { readFile as readBack, writeFile as writeBack } from 'fs';
import { isNil } from 'lodash';
import { promisify } from 'util';

export const FILE_ENCODING = 'utf-8';
export const readFile = promisify(readBack);
export const writeFile = promisify(writeBack);

export async function loadSource(path: string): Promise<string> {
  if (path === '-') {
    return readFile(0, {
      encoding: FILE_ENCODING,
    });
  } else {
    return readFile(path, {
      encoding: FILE_ENCODING,
    });
  }
}

export async function writeSource(path: string, data: string): Promise<void> {
  if (path === '-') {
    return new Promise((res, rej) => {
      process.stdout.write(data, (err: Error | null | undefined) => {
        if (isNil(err)) {
          res();
        } else {
          rej(err);
        }
      });
    });
  } else {
    return writeFile(path, data, {
      encoding: FILE_ENCODING,
    });
  }
}
