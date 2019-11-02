import { VisitorContext } from './VisitorContext';
import { VisitorResult } from './VisitorResult';

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
