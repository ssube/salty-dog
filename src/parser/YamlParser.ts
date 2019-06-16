import { safeDump, safeLoad } from 'js-yaml';

import { CONFIG_SCHEMA } from 'src/config/schema';
import { Parser } from 'src/parser';

export class YamlParser implements Parser {
  dump(data: any): string {
    return safeDump(data, {
      schema: CONFIG_SCHEMA,
    });
  }

  parse(body: string): any {
    return safeLoad(body, {
      schema: CONFIG_SCHEMA,
    });
  }
}