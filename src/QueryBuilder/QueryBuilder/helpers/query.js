import { COLUMN_KEYS } from '../../../constants/columnKeys';
import { valueBuilder } from './valueBuilder';
import { OPERATORS } from '../../../constants/operators';
import { getOperatorOptions } from './selectOptions';

export const DEFAULT_PREVIEW_INTERVAL = 5000;

export const getQueryStr = (rows, fieldOptions) => {
  return rows.reduce((str, row) => {
    const bool = row[COLUMN_KEYS.BOOLEAN].current;
    const field = row[COLUMN_KEYS.FIELD].current;
    const operator = row[COLUMN_KEYS.OPERATOR].current;
    const value = row[COLUMN_KEYS.VALUE].current;
    const builtValue = valueBuilder({ value, field, operator, fieldOptions });
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
    && Boolean(item[COLUMN_KEYS.VALUE].current?.length));
};

export const getTransformedValue = (val) => {
  // cover the case when user types comma-separated values instead multi-select
  if (typeof val === 'string') {
    return val.split(',').map(item => item.trim());
  }

  if (Array.isArray(val)) {
    return val.map(({ value }) => value);
  }

  return val;
};

export const sourceToMongoQuery = (source) => {
  const query = {};
  const andQuery = [];
  let queryItem = {};

  const escapeRegex = (value) => {
    const escapedValue = value.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

    return `${escapedValue}`;
  };

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
        queryItem = { [field]: { $in: getTransformedValue(value) } };
        break;
      case OPERATORS.NOT_IN:
        queryItem = { [field]: { $nin: getTransformedValue(value) } };
        break;
      case OPERATORS.STARTS_WITH:
        queryItem = { [field]: { $regex: new RegExp(`^${escapeRegex(value)}`).source } };
        break;
      case OPERATORS.CONTAINS:
        queryItem = { [field]: { $regex: new RegExp(escapeRegex(value)).source } };
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

const cleanerRegex = /((^\^?)|(\/$))/g;
const getSourceFields = (field) => ({
  $eq: (value) => ({ operator: OPERATORS.EQUAL, value }),
  $ne: (value) => ({ operator: OPERATORS.NOT_EQUAL, value }),
  $gt: (value) => ({ operator: OPERATORS.GREATER_THAN, value }),
  $lt: (value) => ({ operator: OPERATORS.LESS_THAN, value }),
  $gte: (value) => ({ operator: OPERATORS.GREATER_THAN_OR_EQUAL, value }),
  $lte: (value) => ({ operator: OPERATORS.LESS_THAN_OR_EQUAL, value }),
  $in: (value) => ({ operator: OPERATORS.IN, value }),
  $nin: (value) => ({ operator: OPERATORS.NOT_IN, value }),
  $regex: (value) => {
    return value?.includes('^')
      ? { operator: OPERATORS.STARTS_WITH, value: value?.replace(cleanerRegex, '') }
      : { operator: OPERATORS.CONTAINS, value: value?.replace(cleanerRegex, '') };
  },
}[field]);

export const mongoQueryToSource = async ({
  initialValues,
  booleanOptions = [],
  fieldOptions,
  intl,
  getParamsSource,
}) => {
  if (!fieldOptions?.length) return [];

  const target = [];
  const andQuery = initialValues.$and || [];

  for (const queryObj of andQuery) {
    const [field, query] = Object.entries(queryObj)[0];
    const mongoOperator = Object.keys(query)[0];
    const mongoValue = query[mongoOperator];

    const { operator, value } = getSourceFields(mongoOperator)(mongoValue);

    if (operator && value) {
      const boolean = OPERATORS.AND;
      const fieldItem = fieldOptions.find(f => f.value === field);
      const { dataType, values, source } = fieldItem;
      const hasSourceOrValues = values || source;
      let formattedValue;

      if (Array.isArray(value) && source) {
        const params = await getParamsSource?.({
          entityTypeId: source?.entityTypeId,
          columnName: source?.columnName,
          searchValue: '',
        });

        formattedValue = value.map(item => params?.content?.find(param => param.value === item));
      }

      const item = {
        boolean: { options: booleanOptions, current: boolean },
        field: { options: fieldOptions, current: field, dataType },
        operator: {
          dataType,
          options: getOperatorOptions({
            dataType,
            hasSourceOrValues,
            intl,
          }),
          current: operator,
        },
        value: { current: formattedValue || value, source, options: values },
      };

      target.push(item);
    }
  }

  return target;
};
