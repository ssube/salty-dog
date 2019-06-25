import { safeDump, safeLoadAll } from 'js-yaml';

import { CONFIG_SCHEMA } from 'src/config/schema';
import { Parser } from 'src/parser';

export class YamlParser implements Parser {
  dump(...data: Array<any>): string {
    return safeDump(data, {
      schema: CONFIG_SCHEMA,
    });
  }

  parse(body: string): Array<any> {
    const docs: Array<any> = [];
    safeLoadAll(body, (doc: any) => docs.push(doc), {
      schema: CONFIG_SCHEMA,
    });
    return docs;
  }
}