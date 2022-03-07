import { getOrDefault, leftPad, setOrPush } from '@apextoaster/js-utils';

import { RuleResult } from '../rule/index.js';
import { Reporter } from './index.js';

const MARGIN = 2;
const COL_DELIMITER = '|';
const ROW_DELIMITER = '\n';

export class TableReporter implements Reporter {
  public async report(results: ReadonlyArray<RuleResult>): Promise<string> {
    const rules = new Map<string, number>();
    for (const result of results) {
      const prev = getOrDefault(rules, result.rule.name, 0);
      rules.set(result.rule.name, prev + result.errors.length);
    }

    const rows: Array<{rule: string; count: number}> = [];
    for (const [rule, count] of rules) {
      rows.push({
        rule,
        count,
      });
    }


    return printTable(rows, ['rule', 'count']);
  }
}

export interface TableOptions {
  margin: 0;
  separator: '|';
}

export interface ColumnOptions {
  align: 'center';
}

export function printTable<T>(rows: Array<T>, fields: Array<keyof T>): string {
  const cols = new Map<keyof T, Array<string>>();

  // add headers
  for (const field of fields) {
    cols.set(field, [field.toString()]);
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
    lens.set(key, max + MARGIN);
  }

  // build table
  const parts = [];
  for (let rowIndex = 0; rowIndex < rows.length; ++rowIndex) {
    parts.push(COL_DELIMITER);

    for (const [key, values] of cols) {
      const value = values[rowIndex];
      const len = getOrDefault(lens, key, MARGIN);
      const padded = leftPad(value, len, ' ');

      parts.push(padded);
      parts.push(COL_DELIMITER);
    }

    parts.push(ROW_DELIMITER);
  }

  return parts.join('');
}
