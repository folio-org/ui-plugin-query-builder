import moment from 'moment';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';
import { ISO_FORMAT } from './timeUtils';

export const getCommaSeparatedStr = (arr) => {
  return arr?.map(el => `"${el.value}"`).join(',');
};

const getQuotedStr = (value) => {
  return `"${value}"`;
};

const getFormattedDate = (value) => {
  const date = moment(value);

  date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  return (value ? `"${date.format(ISO_FORMAT)}"` : '');
};

const getFormattedUUID = (value, isInRelatedOperator) => {
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

    [DATA_TYPES.ArrayType]: () => getCommaSeparatedStr(value),

    [DATA_TYPES.EnumType]: () => getCommaSeparatedStr(value),

    [DATA_TYPES.BooleanType]: () => getQuotedStr(value),

    [DATA_TYPES.ObjectType]: () => getQuotedStr(value),

    [DATA_TYPES.DateType]: () => getFormattedDate(value),

    [DATA_TYPES.OpenUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),
  };

  return valueMap[dataType]?.();
};
