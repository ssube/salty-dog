import { safeLoad } from 'js-yaml';

import { CONFIG_SCHEMA } from 'src/config';
import { Parser } from 'src/parser';

export class YamlParser implements Parser {
  parse(body: string): any {
    return safeLoad(body, {
      schema: CONFIG_SCHEMA,
    });
  }
}