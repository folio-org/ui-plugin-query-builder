import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';
import { COLUMN_KEYS } from '../../../constants/columnKeys';

const getOperatorsWithPlaceholder = (options, intl) => {
  return [
    {
      value: '',
      label: intl.formatMessage({ id: 'ui-plugin-query-builder.control.operator.placeholder' }),
      disabled: true,
    },
    ...options,
  ];
};

const baseLogicalOperators = () => [
  { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
  { label: OPERATORS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
  { label: OPERATORS.LESS_THAN, value: OPERATORS.LESS_THAN },
];

const extendedLogicalOperators = () => [
  ...baseLogicalOperators,
  { label: OPERATORS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
  { label: OPERATORS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
];

const UUIDOperators = () => [
  { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
  { label: OPERATORS.IN, value: OPERATORS.IN },
  { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
];

const stringOperators = (hasSourceOrValues) => {
  return [
    { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
    { label: OPERATORS.IN, value: OPERATORS.IN },
    { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
    { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
    ...(hasSourceOrValues ? [] : [
      { label: OPERATORS.CONTAINS, value: OPERATORS.CONTAINS },
      { label: OPERATORS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
    ]),
  ];
};

const booleanOperators = () => [
  { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
];

export const getOperatorOptions = ({
  dataType,
  hasSourceOrValues,
  intl,
}) => {
  switch (dataType) {
    case DATA_TYPES.StringType:
      return getOperatorsWithPlaceholder(stringOperators(hasSourceOrValues), intl);

    case DATA_TYPES.RangedUUIDType:
      return getOperatorsWithPlaceholder(UUIDOperators(), intl);

    case DATA_TYPES.OpenUUIDType:
      return getOperatorsWithPlaceholder(UUIDOperators(), intl);

    case DATA_TYPES.IntegerType:
      return getOperatorsWithPlaceholder(baseLogicalOperators(), intl);

    case DATA_TYPES.ArrayType:
      return getOperatorsWithPlaceholder(UUIDOperators(), intl);

    case DATA_TYPES.DateType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(), intl);

    case DATA_TYPES.ObjectType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(), intl);

    case DATA_TYPES.EnumType:
      return getOperatorsWithPlaceholder(UUIDOperators(), intl);

    case DATA_TYPES.BooleanType:
      return getOperatorsWithPlaceholder(booleanOperators(), intl);

    default:
      return [];
  }
};

export const getFieldOptions = (options) => {
  return options?.map(et => ({
    label: et.labelAlias,
    value: et.name,
    dataType: et.dataType.dataType,
    values: et.values,
    source: et.source,
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
