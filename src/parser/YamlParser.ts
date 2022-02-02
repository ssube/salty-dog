import { createInclude, createSchema } from '@apextoaster/js-yaml-schema';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SCHEMA, dump, loadAll, Schema } from 'js-yaml';
import { join } from 'path';

import { Parser } from './index.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class YamlParser implements Parser {
  protected schema: Schema;

  constructor() {
    const include = createInclude({
      exists: existsSync,
      join,
      read: readFileSync,
      resolve: realpathSync,
      schema: DEFAULT_SCHEMA,
    });

    this.schema = createSchema({}).extend([
      include.includeType,
    ]);

    include.setSchema(this.schema);
  }

  public dump(...data: Array<unknown>): string {
    const docs: Array<unknown> = [];
    for (const doc of data) {
      const part = dump(doc, {
        schema: this.schema,
      });
      docs.push(part);
    }
    return docs.join('\n---\n\n');
  }

  public parse(body: string): Array<unknown> {
    const docs: Array<unknown> = [];
    loadAll(body, (doc: unknown) => docs.push(doc), {
      schema: this.schema,
    });
    return docs;
  }
}
