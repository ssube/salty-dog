import { Document, Source } from '../source';

export interface Parser {
  dump(...data: Array<Document>): string;
  parse(data: Source): Array<Document>;
}
