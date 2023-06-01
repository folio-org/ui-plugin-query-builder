import moment from 'moment';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';
import { ISO_FORMAT } from './timeUtils';

export const getCommaSeparatedStr = (arr) => {
  const str = arr?.map(el => `"${el.value}"`).join(',');

  return `${str}`;
};

export const getQuotedStr = (value) => {
  return `"${value}"`;
};

export const getFormattedDate = (value) => {
  const date = moment(value).format(ISO_FORMAT);

  return value ? `"${date}"` : '';
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

    [DATA_TYPES.RangedUUIDType]: () => getQuotedStr(value),

    [DATA_TYPES.ArrayType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value)),

    [DATA_TYPES.EnumType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value)),

    [DATA_TYPES.BooleanType]: () => getQuotedStr(value),

    [DATA_TYPES.ObjectType]: () => getQuotedStr(value),

    [DATA_TYPES.DateType]: () => getFormattedDate(value),

    [DATA_TYPES.OpenUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),
  };

  return valueMap[dataType]?.();
};

export const isValueValid = (value, dataType) => {
  if (dataType === DATA_TYPES.NumberType) {
    const exp = /^[0-9\b]+$/;

    if (exp.test(value)) {
      return true;
    }
  }

  return true;
};
