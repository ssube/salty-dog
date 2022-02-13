import { createInclude, createSchema } from '@apextoaster/js-yaml-schema';
import { existsSync, readFileSync, realpathSync } from 'fs';
import { DEFAULT_SCHEMA, dump, loadAll, Schema } from 'js-yaml';
import { join } from 'path';
import { Document, Source } from '../source.js';

import { Parser } from './index.js';

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

  public parse(source: Source): Array<Document> {
    const docs: Array<Document> = [];
    loadAll(source.data, (data: unknown) => docs.push({
      data,
      source,
    }), {
      schema: this.schema,
    });
    return docs;
  }
}
