import { promisify } from 'util';
import { readFile, writeFile } from 'fs';

export const readFileSync = promisify(readFile);
export const writeFileSync = promisify(writeFile);

export async function loadSource(path: string): Promise<string> {
  if (path === '-') {
    return readFileSync(0, 'utf-8');
  } else {
    return readFileSync(path, 'utf-8');
  }
}

export async function writeSource(path: string, data: string): Promise<void> {
  if (path === '-') {
    process.stdout.write(data);
  } else {
    return writeFileSync(path, data, {
      encoding: 'utf-8',
    });
  }
}
