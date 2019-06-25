export interface Parser {
  dump(...data: Array<any>): string;
  parse(body: string): Array<any>;
}