import { getOrDefault, leftPad, mustGet, setOrPush } from '@apextoaster/js-utils';

import { Rule, RuleResult } from '../rule/index.js';
import { Reporter } from './index.js';

const MARGIN = '  ';
const COL_DELIMITER = '|';
const HEAD_DELIMITER = '-';
const ROW_DELIMITER = '\n';
const EXTRA_ROWS = 2;

interface RuleCounts {
  changes: number;
  errors: number;
  rule: string;
}

export const ERROR_EMPTY_RESULT = 'no results to format';

export class TableReporter implements Reporter {
  public async report(results: ReadonlyArray<RuleResult>): Promise<string> {
    const rules = new Map<Rule, RuleCounts>();
    for (const result of results) {
      const prev = getOrDefault(rules, result.rule, {
        changes: 0,
        errors: 0,
        rule: result.rule.name,
      });
      prev.changes += result.changes.length;
      prev.errors += result.errors.length;
      rules.set(result.rule, prev);
    }

    const rows = Array.from(rules.values());

    if (rows.length === 0) {
      return ERROR_EMPTY_RESULT;
    }

    return printTable(rows, ['rule', 'errors', 'changes'], {
      delimiter: {
        column: COL_DELIMITER,
        head: HEAD_DELIMITER,
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
    head: string;
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

  // get longest item in each column
  const lens = new Map<keyof T, number>();
  for (const [key, values] of cols) {
    const max = values.reduce((p, c) => Math.max(p, c.length), 0);
    lens.set(key, max);
  }

  // add delimiter row
  for (const field of fields) {
    const max = mustGet(lens, field);
    const gap = leftPad('', max, options.delimiter.head);
    const col = mustGet(cols, field);

    col.splice(1, 0, gap);
  }

  // build table
  const parts = [];
  for (let rowIndex = 0; rowIndex < rows.length + EXTRA_ROWS; ++rowIndex) { // <= because headers were added
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
