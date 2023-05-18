import moment from 'moment';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';
import { ISO_FORMAT } from './timeUtils';

export const getCommaSeparatedStr = (arr) => {
  return arr?.map(el => `"${el.value}"`).join(',');
};

export const valueBuilder = ({ value, field, operator, fieldOptions }) => {
  const dataType = fieldOptions?.find(o => o.value === field)?.dataType || DATA_TYPES.BooleanType;
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  // add additional templates for dataTypes
  const valueMap = {
    [DATA_TYPES.StringType]: () => `"${value}"`,

    [DATA_TYPES.IntegerType]: () => value,

    [DATA_TYPES.BooleanType]: () => `"${value}"`,

    [DATA_TYPES.ObjectType]: () => `"${value}"`,

    [DATA_TYPES.RangedUUIDType]: () => {
      if (Array.isArray(value)) {
        return `(${getCommaSeparatedStr(value)})`;
      }

      return `"${value}"`;
    },

    [DATA_TYPES.DateType]: () => {
      const date = moment(value);

      date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      return (value ? `"${date.format(ISO_FORMAT)}"` : '');
    },

    [DATA_TYPES.ArrayType]: () => {
      if (Array.isArray(value) && isInRelatedOperator) {
        return `(${getCommaSeparatedStr(value)})`;
      }

      return `"${value}"`;
    },

    [DATA_TYPES.OpenUUIDType]: () => (
      isInRelatedOperator
        ? `"${value.replace(/,\s?/g, '","')}"`
        : `"${value}"`
    ),

    [DATA_TYPES.EnumType]: () => {
      if (Array.isArray(value) && isInRelatedOperator) {
        return `(${getCommaSeparatedStr(value)})`;
      }

      return `"${value}"`;
    },
  };

  return valueMap[dataType]?.();
};
