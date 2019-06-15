import { promisify } from 'util';
import { readFile } from 'fs';

const readFileSync = promisify(readFile);

export async function loadSource(path: string): Promise<string> {
  if (path === '-') {
    return readFileSync(0, 'utf-8');
  } else {
    return readFileSync(path, 'utf-8');
  }
}
