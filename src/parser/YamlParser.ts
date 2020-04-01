import { CONFIG_SCHEMA } from '@apextoaster/js-yaml-schema';
import { safeDump, safeLoadAll } from 'js-yaml';

import { Parser } from '../parser';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class YamlParser implements Parser {
  public dump(...data: Array<any>): string {
    const docs: Array<any> = [];
    for (const doc of data) {
      const part = safeDump(doc, {
        schema: CONFIG_SCHEMA,
      });
      docs.push(part);
    }
    return docs.join('\n---\n\n');
  }

  public parse(body: string): Array<any> {
    const docs: Array<any> = [];
    safeLoadAll(body, (doc: any) => docs.push(doc), {
      schema: CONFIG_SCHEMA,
    });
    return docs;
  }
}
