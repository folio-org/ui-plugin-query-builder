import { dayjs } from '@folio/stripes/components';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';
import { CONTROL_TYPES, getControlType } from './getControlTypes';

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

    [DATA_TYPES.DateType]: () => getQuotedStr(value, isInRelatedOperator),

    [DATA_TYPES.DateTimeType]: () => getQuotedStr(formatDateToPreview(value, intl, timezone), isInRelatedOperator),

    [DATA_TYPES.OpenUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),

    [DATA_TYPES.StringUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),
  };

  return valueMap[dataType]?.();
};

export const retainValueOnOperatorChange = ({
  dataType,
  operator,
  newOperator,
  source,
  availableValues,
  prevValue,
}) => {
  const prevType = getControlType({ dataType, operator, source, availableValues });
  const newType = getControlType({ dataType, operator: newOperator, source, availableValues });

  if (!prevType || !newType) {
    return '';
  }

  // If control types are the same, retain previous value
  if (prevType === newType) {
    return prevValue;
  }

  // Handle select single/multi conversions
  if (prevType === CONTROL_TYPES.SELECT_MULTI && newType === CONTROL_TYPES.SELECT_SINGLE) {
    return Array.isArray(prevValue) ? (prevValue[0]?.value ?? prevValue[0]?.id) : prevValue;
  }

  // Handle select multi/single conversions
  if (prevType === CONTROL_TYPES.SELECT_SINGLE && newType === CONTROL_TYPES.SELECT_MULTI) {
    return prevValue ? [{
      value: prevValue,
      label: availableValues?.find(option => option.value === prevValue)?.label ?? prevValue,
    }] : prevValue;
  }

  return '';
};
