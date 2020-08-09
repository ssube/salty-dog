import { createSchema } from '@apextoaster/js-yaml-schema';
import { safeDump, safeLoadAll, Schema } from 'js-yaml';

import { INCLUDE_OPTIONS } from '../config';
import { Parser } from '../parser';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class YamlParser implements Parser {
  protected readonly schema: Schema;

  constructor() {
    this.schema = createSchema({
      include: {
        ...INCLUDE_OPTIONS,
      }
    });
  }

  public dump(...data: Array<any>): string {
    const docs: Array<any> = [];
    for (const doc of data) {
      const part = safeDump(doc, {
        schema: this.schema,
      });
      docs.push(part);
    }
    return docs.join('\n---\n\n');
  }

  public parse(body: string): Array<any> {
    const docs: Array<any> = [];
    safeLoadAll(body, (doc: any) => docs.push(doc), {
      schema: this.schema,
    });
    return docs;
  }
}
