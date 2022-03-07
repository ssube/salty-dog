import { getOrDefault, leftPad, setOrPush } from '@apextoaster/js-utils';

import { RuleResult } from '../rule/index.js';
import { Reporter } from './index.js';

const MARGIN = '  ';
const COL_DELIMITER = '|';
const ROW_DELIMITER = '\n';

export class TableReporter implements Reporter {
  public async report(results: ReadonlyArray<RuleResult>): Promise<string> {
    const rules = new Map<string, {changes: number; errors: number}>();
    for (const result of results) {
      const prev = getOrDefault(rules, result.rule.name, {changes: 0, errors: 0});
      prev.changes += result.changes.length;
      prev.errors += result.errors.length;
      rules.set(result.rule.name, prev);
    }

    const rows: Array<{rule: string; changes: number; errors: number}> = [];
    for (const [rule, counts] of rules) {
      rows.push({
        rule,
        changes: counts.changes,
        errors: counts.errors,
      });
    }

    return printTable(rows, ['rule', 'errors', 'changes'], {
      delimiter: {
        column: COL_DELIMITER,
        row: ROW_DELIMITER,
      },
      margin: MARGIN,
      padding: ' ',
    });
  }
}

export interface TableOptions {
  delimiter: {
    column: string;
    row: string;
  };
  margin: string;
  padding: string;
}

export interface ColumnOptions {
  align: 'center';
}

export function printTable<T>(rows: Array<T>, fields: Array<keyof T>, options: TableOptions): string {
  const cols = new Map<keyof T, Array<string>>();

  // add headers
  for (const field of fields) {
    cols.set(field, [
      field.toString(),
    ]);
  }

  // collect field values as strings
  for (const row of rows) {
    for (const field of fields) {
      const value = String(row[field]);
      setOrPush(cols, field, value);
    }
  }

  // get longest item in each
  const lens = new Map<keyof T, number>();
  for (const [key, value] of cols) {
    const max = value.reduce((p, c) => Math.max(p, c.length), 0);
    lens.set(key, max);
  }

  // build table
  const parts = [];
  for (let rowIndex = 0; rowIndex <= rows.length; ++rowIndex) { // <= because headers were added
    parts.push(options.delimiter.column);

    for (const [key, values] of cols) {
      const value = values[rowIndex];
      const len = getOrDefault(lens, key, value.length);
      const padded = leftPad(value, len, options.padding);

      parts.push(options.margin);
      parts.push(padded);
      parts.push(options.margin);
      parts.push(options.delimiter.column);
    }

    parts.push(options.delimiter.row);
  }

  return parts.join('');
}
