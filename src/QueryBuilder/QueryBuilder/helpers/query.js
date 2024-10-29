import { COLUMN_KEYS } from '../../../constants/columnKeys';
import { valueBuilder } from './valueBuilder';
import { BOOLEAN_OPERATORS, BOOLEAN_OPERATORS_MAP, OPERATORS } from '../../../constants/operators';
import { getOperatorOptions } from './selectOptions';

export const DEFAULT_PREVIEW_INTERVAL = 3000;

export const getQueryStr = (rows, fieldOptions) => {
  return rows.reduce((str, row, index) => {
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

    // if there is a boolean operator and it's not the first row - add it to the query
    if (bool && index > 0) {
      str += ` ${BOOLEAN_OPERATORS_MAP[bool] || ''} ${baseQuery}`;
    } else {
      str += baseQuery;
    }

    return str;
  }, '');
};

export const isQueryValid = (source) => {
  const isValueValid = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'boolean') {
      return true;
    }

    return Boolean(value);
  };

  return source.length > 0 && source.every(item => item[COLUMN_KEYS.FIELD].current
    && item[COLUMN_KEYS.OPERATOR].current
    && isValueValid(item[COLUMN_KEYS.VALUE].current));
};

export const getTransformedValue = (val) => {
  // cover the case when user types comma-separated values instead multi-select
  if (typeof val === 'string') {
    return val.split(',').map(item => item.trim());
  }

  if (Array.isArray(val)) {
    // when using multi-select - 'item.value'
    // for initial value case = just 'item'
    return val.map((item) => item?.value || item);
  }

  return val;
};

const escapeRegex = (value) => {
  const escapedValue = value?.toString().replace(/[/^$*+?.()|[\]{}]/g, '\\$&');

  return `${escapedValue}`;
};

const getQueryOperand = (item) => {
  let queryOperand = {};

  const field = item.field.current;
  const operator = item.operator.current;
  const value = item.value.current;

  switch (operator) {
    case OPERATORS.EQUAL:
      queryOperand = { [field]: { $eq: value } };
      break;
    case OPERATORS.NOT_EQUAL:
      queryOperand = { [field]: { $ne: value } };
      break;
    case OPERATORS.GREATER_THAN:
      queryOperand = { [field]: { $gt: value } };
      break;
    case OPERATORS.GREATER_THAN_OR_EQUAL:
      queryOperand = { [field]: { $gte: value } };
      break;
    case OPERATORS.LESS_THAN:
      queryOperand = { [field]: { $lt: value } };
      break;
    case OPERATORS.LESS_THAN_OR_EQUAL:
      queryOperand = { [field]: { $lte: value } };
      break;
    case OPERATORS.IN:
      queryOperand = { [field]: { $in: getTransformedValue(value) } };
      break;
    case OPERATORS.NOT_IN:
      queryOperand = { [field]: { $nin: getTransformedValue(value) } };
      break;
    case OPERATORS.STARTS_WITH:
      queryOperand = { [field]: { $regex: new RegExp(`^${escapeRegex(value)}`).source } };
      break;
    case OPERATORS.CONTAINS:
      queryOperand = { [field]: { $regex: new RegExp(escapeRegex(value)).source } };
      break;
    case OPERATORS.NOT_CONTAINS:
      queryOperand = { [field]: { $not_contains: value } };
      break;
    case OPERATORS.CONTAINS_ANY:
      queryOperand = { [field]: { $contains_any: getTransformedValue(value) } };
      break;
    case OPERATORS.NOT_CONTAINS_ANY:
      queryOperand = { [field]: { $not_contains_any: getTransformedValue(value) } };
      break;
    case OPERATORS.CONTAINS_ALL:
      queryOperand = { [field]: { $contains_all: getTransformedValue(value) } };
      break;
    case OPERATORS.NOT_CONTAINS_ALL:
      queryOperand = { [field]: { $not_contains_all: getTransformedValue(value) } };
      break;
    case OPERATORS.EMPTY:
      queryOperand = { [field]: { $empty: value } };
      break;
    default:
      break;
  }

  return queryOperand;
};

export const sourceToMongoQuery = (source) => {
  const query = {};
  // A temporary solution to searching for the first operand and its operator, since we only support one at the moment.
  const firstOperand = source.find(item => Boolean(item.boolean.current));
  const boolOperator = firstOperand?.boolean.current;
  const queryOperands = source.map(getQueryOperand);

  if (boolOperator) {
    query[boolOperator] = queryOperands;
  } else {
    return queryOperands[0];
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
  $contains: (value) => ({ operator: OPERATORS.CONTAINS, value }),
  $contains_all: (value) => ({ operator: OPERATORS.CONTAINS_ALL, value }),
  $not_contains_all: (value) => ({ operator: OPERATORS.NOT_CONTAINS_ALL, value }),
  $contains_any: (value) => ({ operator: OPERATORS.CONTAINS_ANY, value }),
  $not_contains_any: (value) => ({ operator: OPERATORS.NOT_CONTAINS_ANY, value }),
  $empty: (value) => ({ operator: OPERATORS.EMPTY, value }),
  $regex: (value) => {
    return value?.includes('^')
      ? { operator: OPERATORS.STARTS_WITH, value: value?.replace(cleanerRegex, '') }
      : { operator: OPERATORS.CONTAINS, value: value?.replace(cleanerRegex, '') };
  },
}[field]);

const getFormattedSourceField = async ({ item, intl, booleanOptions, fieldOptions, getParamsSource, boolean }) => {
  const [field, query] = Object.entries(item)[0];
  const mongoOperator = Object.keys(query)[0];
  const mongoValue = query[mongoOperator];

  const { operator, value } = getSourceFields(mongoOperator)(mongoValue);

  if (operator) {
    const fieldItem = fieldOptions.find(f => f.value === field);
    const { dataType, values, source } = fieldItem;
    const hasSourceOrValues = values || source;
    let formattedValue;

    if (Array.isArray(value) && hasSourceOrValues) {
      let params = values;

      if (source) {
        params = await getParamsSource?.({
          entityTypeId: source?.entityTypeId,
          columnName: source?.columnName,
          searchValue: '',
        }).then((data) => data?.content);
      }

      formattedValue = value.map(val => params?.find(param => param.value === val));
    }

    return {
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
  }

  return null;
};

export const mongoQueryToSource = async ({
  initialValues,
  booleanOptions = [],
  fieldOptions,
  intl,
  getParamsSource,
}) => {
  if (!fieldOptions?.length || !Object.keys(initialValues).length) return [];

  const key = Object.keys(initialValues)[0];
  const sharedArgs = { intl, booleanOptions, getParamsSource, fieldOptions };

  // handle case when query contains boolean operators (AND, OR, etc.)
  if (Object.values(BOOLEAN_OPERATORS).includes(key)) {
    const formattedSource = [];

    for (const item of initialValues[key]) {
      const formattedItem = await getFormattedSourceField({
        item,
        boolean: key,
        ...sharedArgs,
      });

      formattedSource.push(formattedItem);
    }

    return formattedSource;
  }

  const singleItem = await getFormattedSourceField({
    item: initialValues,
    boolean: '',
    ...sharedArgs,
  });

  return [singleItem];
};
