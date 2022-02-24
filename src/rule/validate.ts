import { doesExist, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { readFileSync } from 'fs';
import { BaseError } from 'noicejs';
import { join } from 'path';

import { dirName } from '../config/index.js';
import { YamlParser } from '../parser/YamlParser.js';
import { VisitorContext } from '../visitor/VisitorContext.js';
import { RuleSourceData } from './load.js';

export function getSchemaPath(): string {
  if (doesExist(process.env.SALTY_DOG_SCHEMA)) {
    return process.env.SALTY_DOG_SCHEMA;
  } else {
    return join(dirName(), 'rules', 'salty-dog.yml');
  }
}

export function loadSchema(): RuleSourceData {
  const path = getSchemaPath();
  const data = readFileSync(path, { encoding: 'utf-8' });

  if (doesExist(data)) {
    const parser = new YamlParser();
    const [schema] = parser.parse({
      data,
      path,
    });
    return mustExist(schema.data) as RuleSourceData;
  }

  throw new NotFoundError('loaded empty schema');
}

export function isObject(it: unknown): it is object {
  return typeof it === 'object';
}

export function validateRules(ctx: VisitorContext, root: unknown): boolean {
  const { definitions: defs, name } = loadSchema();
  const definitions = mustExist(defs);

  if (isObject(definitions.source)) {
    const validCtx = new VisitorContext(ctx);
    validCtx.addSchema(name, definitions);
    const ruleSchema = validCtx.compile(definitions.source);

    if (ruleSchema(root) === true) {
      return true;
    } else {
      ctx.logger.error({ errors: ruleSchema.errors }, 'error validating rules');
      return false;
    }
  } else {
    throw new BaseError('invalid schema, missing source definition');
  }
}

export function validateConfig(ctx: VisitorContext, root: unknown): boolean {
  const { definitions: defs, name } = loadSchema();
  const definitions = mustExist(defs);

  if (isObject(definitions.config)) {
    const validCtx = new VisitorContext(ctx);
    validCtx.addSchema(name, definitions);
    const ruleSchema = validCtx.compile(mustExist(definitions.config));

    if (ruleSchema(root) === true) {
      return true;
    } else {
      ctx.logger.error({ errors: ruleSchema.errors }, 'error validating rules');
      return false;
    }
  } else {
    throw new BaseError('invalid schema, missing config definition');
  }
}
