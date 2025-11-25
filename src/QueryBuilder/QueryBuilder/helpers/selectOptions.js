import { FormattedMessage } from 'react-intl';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { BOOLEAN_OPERATORS, OPERATOR_GROUPS, OPERATORS, OPERATORS_LABELS } from '../../../constants/operators';
import { COLUMN_KEYS } from '../../../constants/columnKeys';

export const REPEATABLE_FIELD_DELIMITER = '[*]->';

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

const ArrayOperators = (hasSourceOrValues) => [
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

const UUIDOperators = () => [
  { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
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

const booleanOperators = (isFromNestedField) => [
  { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
  ...(isFromNestedField ? [] : [{ label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL }]),
  { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
];

export const getOperatorOptions = ({
  dataType,
  hasSourceOrValues,
  isFromNestedField,
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
    case DATA_TYPES.JsonbArrayType:
      return getOperatorsWithPlaceholder(ArrayOperators(hasSourceOrValues), intl);

    case DATA_TYPES.DateType:
    case DATA_TYPES.DateTimeType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(), intl);

    case DATA_TYPES.ObjectType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(), intl);

    case DATA_TYPES.EnumType:
      return getOperatorsWithPlaceholder(UUIDOperators(), intl);

    case DATA_TYPES.BooleanType:
      return getOperatorsWithPlaceholder(booleanOperators(isFromNestedField), intl);

    default:
      return [];
  }
};

export const getColumnsWithProperties = (columns = []) => {
  const ids = columns.filter(o => Boolean(o.idColumnName)).map(o => o.idColumnName) || [];

  return columns
    .filter((o) => !ids.includes(o.name))
    .reduce((acc, item) => {
      if (item.queryable) {
        acc.push(item);
      }

      if (item.dataType?.itemDataType?.properties) {
        const nestedNamedFields = item.dataType.itemDataType?.properties
          .filter((child) => child.queryable && !child.hidden)
          .map((child) => ({
            ...child,
            name: `${item.name}${REPEATABLE_FIELD_DELIMITER}${child.name}`,
          }))
          .toSorted((a, b) => {
            const ka = a.labelAliasFullyQualified ?? a.labelAlias;
            const kb = b.labelAliasFullyQualified ?? b.labelAlias;

            return ka.localeCompare(kb);
          });

        acc.push(...nestedNamedFields);
      }

      return acc;
    }, []);
};

export const getFieldOptions = (options) => {
  return getColumnsWithProperties(options)
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
  // Retain letters (from any language), numbers, spaces, and specific special characters (em dash, en dash, hyphen).
  const cleanedValue = value.replace(/[^\p{L}\p{N}\s—–-]/gu, '');

  // create a case-insensitive regex using the cleaned value.
  const regex = new RegExp(cleanedValue, 'i');

  // filter options based on whether the label matches the simplified pattern.
  return dataOptions.filter(option => regex.test(option.label));
};

export const getOperatorType = (operator) => {
  return Object.keys(OPERATOR_GROUPS).find((type) => OPERATOR_GROUPS[type].includes(operator));
};
