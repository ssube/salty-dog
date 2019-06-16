export interface Parser {
  dump(data: any): string;
  parse(body: string): any;
}