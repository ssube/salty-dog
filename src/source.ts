import { readFile, writeFile } from 'fs';
import { isNil } from 'lodash';
import { promisify } from 'util';

export const FILE_ENCODING = 'utf-8';
export const readFileSync = promisify(readFile);
export const writeFileSync = promisify(writeFile);

export async function loadSource(path: string): Promise<string> {
  if (path === '-') {
    return readFileSync(0, {
      encoding: FILE_ENCODING,
    });
  } else {
    return readFileSync(path, {
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
    return writeFileSync(path, data, {
      encoding: FILE_ENCODING,
    });
  }
}
