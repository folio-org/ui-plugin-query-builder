import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';

export const CONTROL_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT_SINGLE: 'selectSingle',
  SELECT_MULTI: 'selectMulti',
  DATE: 'date',
  DATETIME: 'datetime',
  TRUE_FALSE_SELECT: 'trueFalseSelect',
};

export const getControlType = ({
  dataType,
  operator,
  source,
  availableValues,
}) => {
  const hasOptions = Boolean(source || (availableValues && availableValues.length));

  const isIn = operator === OPERATORS.IN || operator === OPERATORS.NOT_IN;
  const isEqual =
        operator === OPERATORS.EQUAL || operator === OPERATORS.NOT_EQUAL;
  const isEmpty = operator === OPERATORS.EMPTY;

  if (isEmpty) {
    return CONTROL_TYPES.TRUE_FALSE_SELECT;
  }

  switch (dataType) {
    case DATA_TYPES.StringType:
    case DATA_TYPES.ArrayType:
    case DATA_TYPES.JsonbArrayType: {
      if (isIn && hasOptions) return CONTROL_TYPES.SELECT_MULTI;
      if (isEqual && hasOptions) return CONTROL_TYPES.SELECT_SINGLE;

      return CONTROL_TYPES.TEXT;
    }

    case DATA_TYPES.IntegerType:
    case DATA_TYPES.NumberType:
      return hasOptions ? CONTROL_TYPES.SELECT_SINGLE : CONTROL_TYPES.NUMBER;

    case DATA_TYPES.BooleanType:
      return CONTROL_TYPES.SELECT_SINGLE;

    case DATA_TYPES.RangedUUIDType:
    case DATA_TYPES.StringUUIDType:
      return CONTROL_TYPES.TEXT;

    case DATA_TYPES.DateType:
      return CONTROL_TYPES.DATE;

    case DATA_TYPES.DateTimeType:
      return CONTROL_TYPES.DATETIME;

    case DATA_TYPES.OpenUUIDType:
      return isIn ? CONTROL_TYPES.TEXTAREA : CONTROL_TYPES.TEXT;

    case DATA_TYPES.EnumType:
      return isIn ? CONTROL_TYPES.SELECT_MULTI : CONTROL_TYPES.SELECT_SINGLE;

    default:
      return CONTROL_TYPES.TEXT;
  }
};