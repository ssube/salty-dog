import { Source } from '../source';

export interface Loader {
  load(path: string): Source;
}

class FileLoader { }
class FetchLoader { }
class ImportLoader { }
class StreamLoader { }
