import { LogLevel, NullLogger } from 'noicejs';

import { SchemaRule } from '../src/rule/SchemaRule.js';
import { Document, Element } from '../src/source.js';
import { VisitorContext } from '../src/visitor/VisitorContext.js';

export function createErrorContext(name: string) {
  const rule = new SchemaRule({
    check: {},
    desc: name,
    level: LogLevel.Info,
    name,
    select: '',
    tags: [name],
  });
  const ctx = new VisitorContext({
    logger: NullLogger.global,
    schemaOptions: {
      coerce: false,
      defaults: false,
      mutate: false,
    },
  });

  return { ctx, rule };
}

export function makeDocument(data: unknown): Document {
  return {data, source: {data: '', path: ''}};
}

export function makeElement(data: unknown): Element {
  return {
    data,
    document: makeDocument({}),
    index: 0,
  };
}
