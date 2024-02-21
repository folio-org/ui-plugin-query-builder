import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';

export const getCommaSeparatedStr = (arr) => {
  const str = arr?.map(el => `"${el.value}"`).join(',');

  return `${str}`;
};

export const getQuotedStr = (value) => {
  return value ?? (JSON.stringify(value) || '');
};

export const getFormattedUUID = (value, isInRelatedOperator) => {
  return isInRelatedOperator
    ? `"${value.replace(/,\s?/g, '","')}"`
    : getQuotedStr(value);
};

export const valueBuilder = ({ value, field, operator, fieldOptions }) => {
  const dataType = fieldOptions?.find(o => o.value === field)?.dataType || DATA_TYPES.BooleanType;
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  const isArray = Array.isArray(value);
  // add additional templates for dataTypes
  const valueMap = {
    [DATA_TYPES.StringType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value)),

    [DATA_TYPES.IntegerType]: () => (isArray ? getCommaSeparatedStr(value) : value),

    [DATA_TYPES.NumberType]: () => (isArray ? getCommaSeparatedStr(value) : value),

    [DATA_TYPES.RangedUUIDType]: () => getQuotedStr(value),

    [DATA_TYPES.ArrayType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value)),

    [DATA_TYPES.EnumType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value)),

    [DATA_TYPES.BooleanType]: () => getQuotedStr(value),

    [DATA_TYPES.ObjectType]: () => getQuotedStr(value),

    [DATA_TYPES.DateType]: () => getQuotedStr(value),

    [DATA_TYPES.OpenUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),
  };

  return valueMap[dataType]?.();
};
