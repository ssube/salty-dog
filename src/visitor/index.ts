import { VisitorContext } from 'src/visitor/context';

export interface Visitor {
  visit(ctx: VisitorContext, node: any): Promise<number>;
}