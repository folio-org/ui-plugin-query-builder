import { COLUMN_KEYS } from '../constants/columnKeys';

export const getQueryStr = (rows) => {
  return rows.reduce((str, row) => {
    const bool = row[COLUMN_KEYS.BOOLEAN].current;
    const field = row[COLUMN_KEYS.FIELD].current;
    const operator = row[COLUMN_KEYS.OPERATOR].current;
    const value = row[COLUMN_KEYS.VALUE].current;

    const baseQuery = `(${field} ${operator} ${value}) `;

    // if there aren't values yet - return empty string
    if (![bool, field, operator, value].some(val => Boolean(val))) {
      return '';
    }

    if (bool) {
      str += `${bool || ''} ${baseQuery}`;
    } else {
      str += baseQuery;
    }

    return str;
  }, '');
};
