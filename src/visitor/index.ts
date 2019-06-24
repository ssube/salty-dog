import { VisitorContext } from 'src/visitor/context';
import { VisitorResult } from 'src/visitor/result';

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
