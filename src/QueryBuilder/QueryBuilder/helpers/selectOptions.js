import { FormattedMessage } from 'react-intl';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { BOOLEAN_OPERATORS, OPERATORS, OPERATORS_LABELS } from '../../../constants/operators';
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
  { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
  { label: OPERATORS_LABELS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
  { label: OPERATORS_LABELS.LESS_THAN, value: OPERATORS.LESS_THAN },
];

const extendedLogicalOperators = () => [
  ...baseLogicalOperators(),
  { label: OPERATORS_LABELS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
  { label: OPERATORS_LABELS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
  { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
];

const ArrayOperators = () => [
  { label: OPERATORS_LABELS.CONTAINS_ALL, value: OPERATORS.CONTAINS_ALL },
  { label: OPERATORS_LABELS.NOT_CONTAINS_ALL, value: OPERATORS.NOT_CONTAINS_ALL },
  { label: OPERATORS_LABELS.CONTAINS_ANY, value: OPERATORS.CONTAINS_ANY },
  { label: OPERATORS_LABELS.NOT_CONTAINS_ANY, value: OPERATORS.NOT_CONTAINS_ANY },
  { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
];

const UUIDOperators = () => [
  { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
  { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
  { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
  { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
];

export const getFilledValues = (options) => {
  return options?.map(({ value, label }) => ({ value, label: label || value }));
};

const stringOperators = (hasSourceOrValues) => {
  return [
    { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
    { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
    ...(hasSourceOrValues ? [
      { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
      { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
    ] : [
      { label: OPERATORS_LABELS.CONTAINS, value: OPERATORS.CONTAINS },
      { label: OPERATORS_LABELS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
    ]),
    { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
  ];
};

const booleanOperators = () => [
  { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
  { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
  { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
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
    case DATA_TYPES.OpenUUIDType:
    case DATA_TYPES.StringUUIDType:
      return getOperatorsWithPlaceholder(UUIDOperators(), intl);

    case DATA_TYPES.IntegerType:
    case DATA_TYPES.NumberType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(), intl);

    case DATA_TYPES.ArrayType:
      return getOperatorsWithPlaceholder(ArrayOperators(), intl);

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
  const ids = options?.filter(o => Boolean(o.idColumnName)).map(o => o.idColumnName) || [];

  return options
    ?.filter((o) => !ids.includes(o.name))
    .reduce((acc, item) => {
      if (item.queryable) {
        acc.push(item);
      }

      if (item.dataType.itemDataType?.properties) {
        const nestedNamedFields = item.dataType.itemDataType?.properties
          .filter((child) => child.queryable)
          .map((child) => ({
            ...child,
            name: `${item.name}[*]->${child.name}`,
          }));

        acc.push(...nestedNamedFields);
      }

      return acc;
    }, [])
    .map((o) => ({
      label: o.labelAliasFullyQualified || o.labelAlias,
      value: o.name,
      dataType: o.dataType.dataType,
      source: o.source,
      values: getFilledValues(o.values),
    }));
};

export const booleanOptions = [
  { label: 'AND', value: BOOLEAN_OPERATORS.AND },
];

export const staticBooleanOptions = [
  { label: <FormattedMessage id="ui-plugin-query-builder.options.true" />, value: true },
  { label: <FormattedMessage id="ui-plugin-query-builder.options.false" />, value: false },
];

export const sourceTemplate = (fieldOptions = []) => ({
  [COLUMN_KEYS.BOOLEAN]: { options: booleanOptions, current: '' },
  [COLUMN_KEYS.FIELD]: { options: fieldOptions, current: '' },
  [COLUMN_KEYS.OPERATOR]: { options: [], current: '' },
  [COLUMN_KEYS.VALUE]: { current: '' },
});

export const getFilteredOptions = (value, dataOptions) => {
  // retain alphanumeric characters, spaces, and the specific special characters (—,–,-).
  const cleanedValue = value.replace(/[^\w\s—–-]/g, '');

  // create a case-insensitive regex using the cleaned value.
  const regex = new RegExp(cleanedValue, 'i');

  // filter options based on whether the label matches the simplified pattern.
  return dataOptions.filter(option => regex.test(option.label));
};
