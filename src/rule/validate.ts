import { doesExist, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { readFileSync } from 'fs';
import { join } from 'path';

import { dirName } from '../config';
import { YamlParser } from '../parser/YamlParser';
import { VisitorContext } from '../visitor/VisitorContext';
import { RuleSourceData } from './load';

export function loadSchema(): RuleSourceData {
  const path = join(dirName(), 'rules', 'salty-dog.yml');
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

export function validateRules(ctx: VisitorContext, root: unknown): boolean {
  const { definitions: defs, name } = loadSchema();
  const definitions = mustExist(defs);

  const validCtx = new VisitorContext(ctx);
  validCtx.addSchema(name, definitions);
  const ruleSchema = validCtx.compile(mustExist(definitions.source));

  if (ruleSchema(root) === true) {
    return true;
  } else {
    ctx.logger.error({ errors: ruleSchema.errors }, 'error validating rules');
    return false;
  }
}

export function validateConfig(ctx: VisitorContext, root: unknown): boolean {
  const { definitions: defs, name } = loadSchema();
  const definitions = mustExist(defs);

  const validCtx = new VisitorContext(ctx);
  validCtx.addSchema(name, definitions);
  const ruleSchema = validCtx.compile(mustExist(definitions.config));

  if (ruleSchema(root) === true) {
    return true;
  } else {
    ctx.logger.error({ errors: ruleSchema.errors }, 'error validating rules');
    return false;
  }
}
