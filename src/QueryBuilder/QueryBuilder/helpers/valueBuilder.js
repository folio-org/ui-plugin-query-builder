import moment from 'moment';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';
import { ISO_FORMAT } from './timeUtils';

export const valueBuilder = ({ value, field, operator, fieldOptions }) => {
  const dataType = fieldOptions?.find(o => o.value === field)?.dataType || DATA_TYPES.BooleanType;
  // add additional templates for dataTypes
  const valueMap = {
    [DATA_TYPES.StringType]: () => `"${value}"`,

    [DATA_TYPES.IntegerType]: () => value,

    [DATA_TYPES.BooleanType]: () => `"${value}"`,

    [DATA_TYPES.ObjectType]: () => `"${value}"`,

    [DATA_TYPES.RangedUUIDType]: () => (Array.isArray(value)
      ? `(${value?.map(el => `"${el.value}"`).join(',')})`
      : value),

    [DATA_TYPES.DateType]: () => {
      const date = moment(value);

      date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      return (value ? `"${date.format(ISO_FORMAT)}"` : '');
    },

    [DATA_TYPES.ArrayType]: () => (Array.isArray(value) &&
    (operator === OPERATORS.IN || operator === OPERATORS.NOT_IN) ?
      `(${value?.map(el => el.value).join('","')})` : `"${value}"`),

    [DATA_TYPES.OpenUUIDType]: () => (
      (operator === OPERATORS.IN || operator === OPERATORS.NOT_IN)
        ? `"${value.replace(/,\s?/g, '","')}"`
        : `"${value}"`
    ),

    [DATA_TYPES.EnumType]: () => (Array.isArray(value) &&
    (operator === OPERATORS.IN || operator === OPERATORS.NOT_IN) ?
      `(${value?.map(el => `"${el.value}"`).join(',')})` : `"${value}"`),
  };

  return valueMap[dataType]?.();
};
