import { COLUMN_KEYS } from '../constants/columnKeys';
import { valueBuilder } from './valueBuilder';
import { OPERATORS } from '../constants/operators';

export const getQueryStr = (rows) => {
  return rows.reduce((str, row) => {
    const bool = row[COLUMN_KEYS.BOOLEAN].current;
    const field = row[COLUMN_KEYS.FIELD].current;
    const operator = row[COLUMN_KEYS.OPERATOR].current;
    const value = row[COLUMN_KEYS.VALUE].current;
    const buildedValue = valueBuilder(value, field, operator);
    const baseQuery = `(${field} ${operator} ${buildedValue})`;

    // if there aren't values yet - return empty string
    if (![bool, field, operator, value].some(val => Boolean(val))) {
      return '';
    }

    if (bool) {
      str += ` ${bool || ''} ${baseQuery}`;
    } else {
      str += baseQuery;
    }

    return str;
  }, '');
};

export const isQueryValid = (source) => {
  return source.every(item => item[COLUMN_KEYS.FIELD].current
    && item[COLUMN_KEYS.OPERATOR].current
    && Boolean(item[COLUMN_KEYS.VALUE].current));
};

export const sourceToMongoQuery = (source) => {
  const query = {};
  const andQuery = [];
  let queryItem = {};

  source.forEach((item) => {
    const field = item.field.current;
    const operator = item.operator.current;
    const value = item.value.current;

    switch (operator) {
      case OPERATORS.EQUAL:
        queryItem = { [field]: { $eq: value } };
        break;
      case OPERATORS.NOT_EQUAL:
        queryItem = { [field]: { $ne: value } };
        break;
      case OPERATORS.GREATER_THAN:
        queryItem = { [field]: { $gt: value } };
        break;
      case OPERATORS.GREATER_THAN_OR_EQUAL:
        queryItem = { [field]: { $gte: value } };
        break;
      case OPERATORS.LESS_THAN:
        queryItem = { [field]: { $lt: value } };
        break;
      case OPERATORS.LESS_THAN_OR_EQUAL:
        queryItem = { [field]: { $lte: value } };
        break;
      case OPERATORS.IN:
        queryItem = { [field]: { $in: value } };
        break;
      case OPERATORS.NOT_IN:
        queryItem = { [field]: { $nin: value } };
        break;
      case OPERATORS.STARTS_WITH:
        queryItem = { [field]: { $regex: new RegExp(`^${value}`, 'i').toString() } };
        break;
      case OPERATORS.CONTAINS:
        queryItem = { [field]: { $regex: new RegExp(value, 'i').toString() } };
        break;
      case OPERATORS.NOT_CONTAINS:
        queryItem = { [field]: { $not: new RegExp(value, 'i').toString() } };
        break;
      default:
        break;
    }

    andQuery.push(queryItem);
  });

  // temporary solution, because we should support only $and operator
  if (andQuery.length) {
    query.$and = andQuery;
  }

  return query;
};
