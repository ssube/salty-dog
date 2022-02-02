export interface Parser {
  dump(...data: Array<unknown>): string;
  parse(body: string): Array<unknown>;
}
