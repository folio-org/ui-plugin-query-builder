import { COLUMN_KEYS } from '../constants/columnKeys';
import { valueBuilder } from './valueBuilder';
import { OPERATORS } from '../constants/operators';
import { getOperatorOptions } from './selectOptions';

export const getQueryStr = (rows) => {
  return rows.reduce((str, row) => {
    const bool = row[COLUMN_KEYS.BOOLEAN].current;
    const field = row[COLUMN_KEYS.FIELD].current;
    const operator = row[COLUMN_KEYS.OPERATOR].current;
    const value = row[COLUMN_KEYS.VALUE].current;
    const builtValue = valueBuilder(value, field, operator);
    const baseQuery = `(${field} ${operator} ${builtValue})`;

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
        queryItem = { [field]: { $regex: new RegExp(`^${value}`).toString() } };
        break;
      case OPERATORS.CONTAINS:
        queryItem = { [field]: { $regex: new RegExp(value).toString() } };
        break;
      case OPERATORS.NOT_CONTAINS:
        queryItem = { [field]: { $not: new RegExp(value).toString() } };
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

const cleanerRegex = /^\/\^?|\/$/g;
const getSourceFields = (field) => ({
  $eq: (value) => ({ operator: OPERATORS.EQUAL, value }),
  $ne: (value) => ({ operator: OPERATORS.NOT_EQUAL, value }),
  $gt: (value) => ({ operator: OPERATORS.GREATER_THAN, value }),
  $lt: (value) => ({ operator: OPERATORS.LESS_THAN, value }),
  $gte: (value) => ({ operator: OPERATORS.GREATER_THAN_OR_EQUAL, value }),
  $lte: (value) => ({ operator: OPERATORS.LESS_THAN_OR_EQUAL, value }),
  $in: (value) => ({ operator: OPERATORS.IN, value }),
  $nin: (value) => ({ operator: OPERATORS.NOT_IN, value }),
  $not: (value) => ({ operator: OPERATORS.NOT_CONTAINS, value: value?.replace(cleanerRegex, '') }),
  $regex: (value) => {
    return value?.includes('^')
      ? { operator: OPERATORS.STARTS_WITH, value: value?.replace(cleanerRegex, '') }
      : { operator: OPERATORS.CONTAINS, value: value?.replace(cleanerRegex, '') };
  },
}[field]);

export const mongoQueryToSource = ({
  mongoQuery,
  booleanOptions = [],
  fieldOptions = [],
}) => {
  const target = [];
  const andQuery = mongoQuery.$and;

  if (andQuery) {
    andQuery.forEach((queryObj) => {
      const [field, query] = Object.entries(queryObj)[0];
      const mongoOperator = Object.keys(query)[0];
      const mongoValue = query[mongoOperator];

      const { operator, value } = getSourceFields(mongoOperator)(mongoValue);

      if (operator && value) {
        const boolean = OPERATORS.AND;

        const fieldItem = fieldOptions.find(f => f.value === field);
        const type = fieldItem?.dataType;

        const item = {
          boolean: { options: booleanOptions, current: boolean },
          field: { options: fieldOptions, current: field },
          operator: { options: getOperatorOptions(type), current: operator },
          value: { current: value },
        };

        target.push(item);
      }
    });
  }

  return target;
};
