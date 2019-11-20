import { NullLogger } from 'noicejs';

import { RuleVisitorData, RuleVisitorError } from '../../src/rule/RuleVisitor';
import { VisitorContext } from '../../src/visitor/VisitorContext';

export function testContext() {
  return new VisitorContext<RuleVisitorData, RuleVisitorError>({
    logger: NullLogger.global,
    schemaOptions: {
      coerce: false,
      defaults: false,
      mutate: false,
    },
  });
}

