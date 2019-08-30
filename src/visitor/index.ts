import { VisitorContext } from './context';
import { VisitorResult } from './result';

export interface Visitor<TResult extends VisitorResult> {
  /**
   * Select nodes eligible to be visited.
   **/
  pick(ctx: VisitorContext, root: any): Promise<Array<any>>;

  /**
   * Visit a node.
   */
  visit(ctx: VisitorContext, node: any): Promise<TResult>;
}
