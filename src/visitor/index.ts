import { Diff } from 'deep-diff';
import { LogLevel } from 'noicejs';

import { VisitorContext } from './VisitorContext';

/**
 * This is a runtime error, not an exception.
 */
export interface VisitorError {
  data: any;
  level: LogLevel;
  msg: string;
}

export interface VisitorResult {
  changes: ReadonlyArray<Diff<any, any>>;
  errors: ReadonlyArray<VisitorError>;
}

export interface Visitor<TResult extends VisitorResult = VisitorResult> {
  /**
   * Select nodes eligible to be visited.
   **/
  pick(ctx: VisitorContext, root: any): Promise<Array<any>>;

  /**
   * Visit a node.
   */
  visit(ctx: VisitorContext, node: any): Promise<TResult>;
}
