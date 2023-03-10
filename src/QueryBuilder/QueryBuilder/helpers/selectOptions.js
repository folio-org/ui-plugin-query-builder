import { DATA_TYPES } from '../constants/dataTypes';
import { OPERATORS } from '../constants/operators';
import { entityType } from '../../../../test/jest/data/entityType';
import { COLUMN_KEYS } from '../constants/columnKeys';

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

export const getOperatorOptions = (dataType) => {
  const options = {
    [DATA_TYPES.RangedUUIDType]: rangedUUIDOperators,

    [DATA_TYPES.OpenUUIDType]: baseLogicalOperators,

    [DATA_TYPES.IntegerType]: baseLogicalOperators,

    [DATA_TYPES.ArrayType]: baseLogicalOperators,

    [DATA_TYPES.DateType]: extendedLogicalOperators,

    [DATA_TYPES.ObjectType]: extendedLogicalOperators,

    [DATA_TYPES.StringType]: [
      { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
      { label: OPERATORS.IN, value: OPERATORS.IN },
      { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
      { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
      { label: OPERATORS.CONTAINS, value: OPERATORS.CONTAINS },
      { label: OPERATORS.NOT_CONTAIN, value: OPERATORS.NOT_CONTAIN },
      { label: OPERATORS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
    ],

    [DATA_TYPES.BooleanType]: [
      { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
      { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
    ],
  };

  return [
    { value: '', label: 'Select operator', disabled: true },
    ...options[dataType],
  ];
};

export const fieldOptions = [
  { value: '', label: 'Select field', disabled: true },
  ...entityType.columns.map(et => ({
    label: et.labelAlias,
    value: et.name,
    dataType: et.dataType.dataType,
    values: et.values,
  })),
];

export const booleanOptions = [
  { label: 'AND', value: 'AND' },
];

export const rowTemplate = {
  [COLUMN_KEYS.BOOLEAN]: { options: booleanOptions, current: '' },
  [COLUMN_KEYS.FIELD]: { options: fieldOptions, current: '' },
  [COLUMN_KEYS.OPERATOR]: { options: [], current: '' },
  [COLUMN_KEYS.VALUE]: { current: '' },
};
