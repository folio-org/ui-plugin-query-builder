import { fieldOptions } from './selectOptions';
import { DATA_TYPES } from '../constants/dataTypes';
import { OPERATORS } from '../constants/operators';

export const valueBuilder = (value, field, operator) => {
  const dataType = fieldOptions.find(o => o.value === field).dataType || DATA_TYPES.BooleanType;
  // add additional templates for dataTypes
  const valueMap = {
    [DATA_TYPES.StringType]: () => `"${value}"`,
    [DATA_TYPES.IntegerType]: () => value,
    [DATA_TYPES.BooleanType]: () => value,
    [DATA_TYPES.RangedUUIDType]: () => (Array.isArray(value) ? `(${value?.map(el => el.value).join(',')})` : value),
    [DATA_TYPES.DateType]: () => value,
    [DATA_TYPES.ArrayType]: () => value,
    [DATA_TYPES.ObjectType]: () => value,
    [DATA_TYPES.OpenUUIDType]: () => value,
    [DATA_TYPES.EnumType]: () => (Array.isArray(value) &&
    (operator === OPERATORS.IN || operator === OPERATORS.NOT_IN) ?
      `(${value?.map(el => el.value).join(',')})` : value),
  };

  return valueMap[dataType]();
};