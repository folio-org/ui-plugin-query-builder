import { fieldOptions } from './selectOptions';
import { DATA_TYPES } from '../constants/dataTypes';

export const valueBuilder = (value, field) => {
  const dataType = fieldOptions.find(o => o.value === field).dataType || DATA_TYPES.BooleanType;
  // TODO: add additional templates for dataTypes
  const valueMap = {
    [DATA_TYPES.StringType]: () => `"${value}"`,
    [DATA_TYPES.BooleanType]: () => value,
  };

  return valueMap[dataType]();
};