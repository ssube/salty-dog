import { LogLevel } from 'noicejs';

/**
 * This is an runtime error, not an exception.
 */
export interface VisitorError {
  data: any;
  level: LogLevel;
  msg: string;
}
