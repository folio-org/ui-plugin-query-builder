import { dayjs } from '@folio/stripes/components';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS, OPERATORS_GROUPS_NAME } from '../../../constants/operators';
import { getOperatorType } from './selectOptions';

export const getCommaSeparatedStr = (arr) => {
  const str = arr?.map(el => `${el?.label}`).join(', ');

  return `[${str}]`;
};

export const getQuotedStr = (value, isInRelatedOperator = false) => {
  if (typeof value === 'boolean') {
    return JSON.stringify(value);
  }

  if (typeof value === 'string' && isInRelatedOperator) {
    return `(${value.split(',').map(item => `${item}`).join(', ')})`;
  }

  return value ? `${value}` : '';
};

export const getFormattedUUID = (value, isInRelatedOperator) => {
  return isInRelatedOperator
    ? `"${value.replace(/,\s?/g, ', ')}"`
    : getQuotedStr(value);
};

const formatDateToPreview = (dateString, intl, timezone) => {
  if (typeof dateString === 'boolean') {
    return dateString;
  }

  const formattedDate = dayjs.utc(dateString);

  if (formattedDate.isValid()) {
    return intl.formatDate(formattedDate.toDate(), { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: timezone });
  }

  return dateString;
};

export const valueBuilder = ({ value, field, operator, fieldOptions, intl, timezone }) => {
  const dataType = fieldOptions?.find(o => o.value === field)?.dataType || DATA_TYPES.BooleanType;
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  const isArray = Array.isArray(value);
  // add additional templates for dataTypes
  const valueMap = {
    [DATA_TYPES.StringType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value, isInRelatedOperator)),

    [DATA_TYPES.IntegerType]: () => (isArray ? getCommaSeparatedStr(value) : value),

    [DATA_TYPES.NumberType]: () => (isArray ? getCommaSeparatedStr(value) : value),

    [DATA_TYPES.RangedUUIDType]: () => getQuotedStr(value, isInRelatedOperator),

    [DATA_TYPES.ArrayType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value, isInRelatedOperator)),

    [DATA_TYPES.JsonbArrayType]: () => (isArray ?
      getCommaSeparatedStr(value)
      :
      getQuotedStr(value, isInRelatedOperator)),

    [DATA_TYPES.EnumType]: () => (isArray ? getCommaSeparatedStr(value) : getQuotedStr(value, isInRelatedOperator)),

    [DATA_TYPES.BooleanType]: () => getQuotedStr(value, isInRelatedOperator),

    [DATA_TYPES.ObjectType]: () => getQuotedStr(value, isInRelatedOperator),

    [DATA_TYPES.DateType]: () => getQuotedStr(formatDateToPreview(value, intl, timezone), isInRelatedOperator),

    [DATA_TYPES.OpenUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),

    [DATA_TYPES.StringUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),
  };

  return valueMap[dataType]?.();
};

export const retainValueOnOperatorChange = (
  prevOperator,
  newOperator,
  memorizedFieldDataType,
  prevValue = '',
  options = [],
) => {
  const prevType = getOperatorType(prevOperator);
  const newType = getOperatorType(newOperator);

  if (!prevType || !newType) {
    return '';
  }

  if (prevType === newType) {
    return prevValue;
  }

  if (prevValue === '') {
    return '';
  }

  if (prevType === OPERATORS_GROUPS_NAME.COMPARISON && newType === OPERATORS_GROUPS_NAME.ARRAY_COMPARISON) {
    if (memorizedFieldDataType === DATA_TYPES.RangedUUIDType) {
      return prevValue;
    }

    return [{ value: prevValue, label: options?.find(option => option.value === prevValue)?.label }];
  }

  if (prevType === OPERATORS_GROUPS_NAME.ARRAY_COMPARISON && newType === OPERATORS_GROUPS_NAME.COMPARISON) {
    if (prevValue.length === 0) {
      return '';
    }

    return Array.isArray(prevValue) ? (prevValue[0]?.value ?? prevValue[0]?.id) : prevValue;
  }

  return '';
};
