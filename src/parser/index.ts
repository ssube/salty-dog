import { Document, Source } from '../source';

export interface Parser {
  /**
   * @TODO should dump deal with Sources as well? does it care about paths?
   */
  dump(...data: Array<Document>): string;
  parse(data: Source): Array<Document>;
}
