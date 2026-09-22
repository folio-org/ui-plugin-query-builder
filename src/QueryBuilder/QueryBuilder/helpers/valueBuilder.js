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
    return `(${value.split(',').map(item => item.trim()).join(', ')})`;
  }

  return value ? `${value}` : '';
};

export const getFormattedUUID = (value, isInRelatedOperator) => {
  return isInRelatedOperator
    ? `"${value.replace(/,\s?/g, ', ')}"`
    : getQuotedStr(value);
};

// Intl date formatting for RTL locales embeds directional marks that scramble
// the date inside the LTR-isolated user-friendly query. Strip them for display;
// the stored FQL uses the raw value and is unaffected.
const DIRECTIONAL_MARKS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

export const stripDirectionalMarks = (value) => (
  typeof value === 'string' ? value.replace(DIRECTIONAL_MARKS, '') : value
);

const formatDateToPreview = (dateString, intl, timezone) => {
  if (typeof dateString === 'boolean') {
    return dateString;
  }

  const formattedDate = dayjs.utc(dateString);

  if (formattedDate.isValid()) {
    return stripDirectionalMarks(
      intl.formatDate(formattedDate.toDate(), { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: timezone }),
    );
  }

  return dateString;
};

// A row seeded from a saved `$in`/`$nin` query on a text-controlled field (UUID types, strings without
// options) holds its ids as a plain array, while a typed value is a comma-separated string. Arrays of
// `{ value, label }` options (multi-select fields) are a different shape and keep their own rendering.
const isPrimitiveArray = (value) => (
  Array.isArray(value) && value.length > 0 && value.every(item => typeof item !== 'object')
);

export const valueBuilder = ({ value: rawValue, field, operator, fieldOptions, intl, timezone }) => {
  const dataType = fieldOptions?.find(o => o.value === field)?.dataType || DATA_TYPES.BooleanType;
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  // Fold a seeded id array into the string the user would have typed, so both render the same way.
  const value = isPrimitiveArray(rawValue) ? rawValue.join(', ') : rawValue;
  const isArray = Array.isArray(value);

  // The "is null/empty" operator carries a True/False value regardless of the field's
  // data type; localize it here so it doesn't fall through to the field-type branch.
  if (operator === OPERATORS.EMPTY && typeof value === 'boolean') {
    return intl.formatMessage({
      id: value ? 'ui-plugin-query-builder.options.true' : 'ui-plugin-query-builder.options.false',
    });
  }

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

    [DATA_TYPES.BooleanType]: () => {
      const isBooleanLike = typeof value === 'boolean' || value === 'true' || value === 'false';

      if (isBooleanLike) {
        const isTrue = value === true || value === 'true';

        return intl.formatMessage({
          id: isTrue ? 'ui-plugin-query-builder.options.true' : 'ui-plugin-query-builder.options.false',
        });
      }

      return getQuotedStr(value, isInRelatedOperator);
    },

    [DATA_TYPES.ObjectType]: () => getQuotedStr(value, isInRelatedOperator),

    [DATA_TYPES.DateType]: () => getQuotedStr(value, isInRelatedOperator),

    [DATA_TYPES.DateTimeType]: () => getQuotedStr(formatDateToPreview(value, intl, timezone), isInRelatedOperator),

    [DATA_TYPES.OpenUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),

    [DATA_TYPES.StringUUIDType]: () => getFormattedUUID(value, isInRelatedOperator),
  };

  return valueMap[dataType]?.();
};

const isInRelatedOperator = (operator) => [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);

// Multi-select values are `{ value, label }` (or `{ id, label }`) objects; text-control arrays hold raw ids.
const getOptionValue = (item) => item?.value ?? item?.id ?? item;

export const retainValueOnOperatorChange = ({
  dataType,
  operator,
  newOperator,
  source,
  valueSourceApi,
  availableValues,
  prevValue,
}) => {
  const prevType = getControlType({ dataType, operator, source, valueSourceApi, availableValues });
  const newType = getControlType({ dataType, operator: newOperator, source, valueSourceApi, availableValues });

  if (!prevType || !newType) {
    return '';
  }

  // If control types are the same, retain previous value
  if (prevType === newType) {
    // A row seeded from a saved `$in`/`$nin` query holds its value as an array even when the field renders a
    // plain text box (UUID types, strings without options), since both operators share the TEXT control.
    // A scalar operator (==, !=, contains, ...) must get a scalar back, or the FQL becomes `{ $eq: [id] }`,
    // which the backend rejects. Keep the first entry, as the select multi → single conversion below does.
    if (Array.isArray(prevValue) && !isInRelatedOperator(newOperator)) {
      return prevValue.length ? getOptionValue(prevValue[0]) : '';
    }

    return prevValue;
  }

  // Handle select single/multi conversions
  if (prevType === CONTROL_TYPES.SELECT_MULTI && newType === CONTROL_TYPES.SELECT_SINGLE) {
    return prevValue.length ? (prevValue[0]?.value || prevValue[0]?.id) : '';
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
