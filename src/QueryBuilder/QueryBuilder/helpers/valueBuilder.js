import { fieldOptions } from './selectOptions';
import { DATA_TYPES } from '../constants/dataTypes';

export const valueBuilder = (value, field) => {
  const dataType = fieldOptions.find(o => o.value === field).dataType || DATA_TYPES.BooleanType;
  // add additional templates for dataTypes
  const valueMap = {
    [DATA_TYPES.StringType]: () => `"${value}"`,
    [DATA_TYPES.IntegerType]: () => value,
    [DATA_TYPES.BooleanType]: () => value,
    [DATA_TYPES.StringType]: () => value,
    [DATA_TYPES.RangedUUIDType]: () => value,
    [DATA_TYPES.DateType]: () => value,
    [DATA_TYPES.ArrayType]: () => value,
    [DATA_TYPES.ObjectType]: () => value,
    [DATA_TYPES.OpenUUIDType]: () => value,
    [DATA_TYPES.EnumType]: () => value,
  };

  return valueMap[dataType]();
};