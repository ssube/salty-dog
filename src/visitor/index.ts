import { Diff } from 'deep-diff';
import { LogLevel } from 'noicejs';

import { VisitorContext } from './VisitorContext';

/**
 * This is a runtime error, not an exception.
 */
export interface VisitorError<TData = any> {
  data: TData;
  level: LogLevel;
  msg: string;
}

export interface VisitorResult<TError = any, TDiffLHS = any, TDiffRHS = any> {
  changes: ReadonlyArray<Diff<TDiffLHS, TDiffRHS>>;
  errors: ReadonlyArray<VisitorError<TError>>;
}

export interface Visitor<TData = any, TError extends TData = any, TResult extends VisitorResult = VisitorResult<TError>> {
  /**
   * Select nodes eligible to be visited.
   **/
  pick(ctx: VisitorContext<TData, TError>, root: any): Promise<Array<any>>;

  /**
   * Visit a node.
   */
  visit(ctx: VisitorContext<TData, TError>, node: any): Promise<TResult>;
}
