import { Logger } from 'noicejs';

export class VisitorContext {
  public readonly changes: Array<any>;
  public readonly errors: Array<any>;
  public readonly logger: Logger;

  constructor(logger: Logger) {
    this.changes = [];
    this.errors = [];
    this.logger = logger;
  }
}