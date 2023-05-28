import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';
import { COLUMN_KEYS } from '../../../constants/columnKeys';

const baseLogicalOperators = [
  { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
  { label: OPERATORS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
  { label: OPERATORS.LESS_THAN, value: OPERATORS.LESS_THAN },
];

const extendedLogicalOperators = [
  ...baseLogicalOperators,
  { label: OPERATORS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
  { label: OPERATORS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
];

const rangedUUIDOperators = [
  { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
  { label: OPERATORS.IN, value: OPERATORS.IN },
  { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
];

export const getFilledValues = (options) => {
  return options?.map(({ value, label }) => ({ value, label: label || value }));
};

export const getOperatorOptions = (dataType, intl) => {
  const options = {
    [DATA_TYPES.RangedUUIDType]: rangedUUIDOperators,

    [DATA_TYPES.OpenUUIDType]: rangedUUIDOperators,

    [DATA_TYPES.IntegerType]: baseLogicalOperators,

    [DATA_TYPES.ArrayType]: rangedUUIDOperators,

    [DATA_TYPES.DateType]: extendedLogicalOperators,

    [DATA_TYPES.ObjectType]: extendedLogicalOperators,

    [DATA_TYPES.EnumType]: rangedUUIDOperators,

    [DATA_TYPES.StringType]: [
      { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
      { label: OPERATORS.IN, value: OPERATORS.IN },
      { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
      { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
      { label: OPERATORS.CONTAINS, value: OPERATORS.CONTAINS },
      { label: OPERATORS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
    ],

    [DATA_TYPES.BooleanType]: [
      { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
      { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
    ],
  };

  return [
    { value: '', label: intl.formatMessage({ id: 'ui-plugin-query-builder.control.operator.placeholder' }), disabled: true },
    ...options[dataType],
  ];
};

export const getFieldOptions = (options) => {
  const ids = options?.filter(o => Boolean(o.idColumnName)).map(o => o.idColumnName) || [];

  return options?.filter(o => !ids.includes(o.name)).map(o => ({
    label: o.labelAlias,
    value: o.name,
    dataType: o.dataType.dataType,
    source: o.source,
    values: getFilledValues(o.values),
  }));
};

export const booleanOptions = [
  { label: 'AND', value: 'AND' },
];

export const sourceTemplate = (fieldOptions) => ({
  [COLUMN_KEYS.BOOLEAN]: { options: booleanOptions, current: '' },
  [COLUMN_KEYS.FIELD]: { options: fieldOptions || [], current: '' },
  [COLUMN_KEYS.OPERATOR]: { options: [], current: '' },
  [COLUMN_KEYS.VALUE]: { current: '' },
});
