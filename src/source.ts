import { isNil, mustExist } from '@apextoaster/js-utils';
import { promises } from 'fs';
import { join } from 'path';
import { Readable, Writable } from 'stream';

let { readdir, readFile, writeFile } = promises;

export const FILE_ENCODING = 'utf-8';

export type Filesystem = Pick<typeof promises, 'readdir' | 'readFile' | 'writeFile'>;

export interface Source {
  data: string;

  /**
   * Path from which this source was loaded.
   */
  path: string;
}

export interface Document {
  /**
   * Document data.
   */
  data: unknown;

  /**
   * Original source.
   */
  source: Source;
}

export interface Element {
  /**
   * Element data.
   */
  data: unknown;

  /**
   * Containing document, *not* the immediate parent.
   */
  document: Document;

  /**
   * Position within a set of selected elements.
   */
  index: number;
}

/**
 * Hook for tests to override the fs fns.
 */
export function setFs(fs: Filesystem) {
  const originalList = readdir;
  const originalRead = readFile;
  const originalWrite = writeFile;

  readdir = fs.readdir;
  readFile = fs.readFile;
  writeFile = fs.writeFile;

  return () => {
    readdir = originalList;
    readFile = originalRead;
    writeFile = originalWrite;
  };
}

export function resetFs() {
  readdir = promises.readdir;
  readFile = promises.readFile;
  writeFile = promises.writeFile;
}

export async function listFiles(path: string): Promise<Array<string>> {
  const dirs: Array<string> = [path];
  const files: Array<string> = [];

  while (dirs.length > 0) {
    const dir = mustExist(dirs.shift());

    const contents = await readdir(dir, {
      withFileTypes: true,
    });

    for (const item of contents) {
      const fullName = join(dir, item.name);
      if (item.isDirectory()) {
        dirs.push(fullName);
      }

      if (item.isFile()) {
        files.push(fullName);
      }
    }
  }

  return files;
}

export async function readSource(path: string, stream: Readable = process.stdin): Promise<string> {
  if (path === '-') {
    return readStream(stream, FILE_ENCODING);
  } else {
    return readFile(path, {
      encoding: FILE_ENCODING,
    });
  }
}

export function readStream(stream: Readable, encoding: BufferEncoding): Promise<string> {
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

export async function writeSource(path: string, data: string, stream: Writable = process.stdout): Promise<void> {
  if (path === '-') {
    return writeStream(stream, data);
  } else {
    return writeFile(path, data, {
      encoding: FILE_ENCODING,
    });
  }
}

export function writeStream(stream: Writable, data: string): Promise<void> {
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
