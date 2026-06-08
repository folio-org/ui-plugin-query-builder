import fuzzysort from 'fuzzysort';
import { FormattedMessage } from 'react-intl';
import { OptionSegment } from '@folio/stripes/components';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { BOOLEAN_OPERATORS, OPERATORS, OPERATORS_LABELS } from '../../../constants/operators';
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

export const hasValueOptions = ({ values, source, valueSourceApi } = {}) => (
  Boolean(values || source || valueSourceApi)
);

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
  return columns
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
      valueSourceApi: o.valueSourceApi,
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

const DASH_CHARS = /[\u2010-\u2015\u2212]/g;

const normalizeSearchText = (value) => (
  typeof value === 'string' ? value.replace(DASH_CHARS, '-') : value
);

const getMatchRanges = (indexes = []) => {
  return Array.from(indexes).reduce((ranges, index) => {
    const lastRange = ranges[ranges.length - 1];

    if (lastRange?.end === index - 1) {
      lastRange.end = index;
    } else {
      ranges.push({ start: index, end: index });
    }

    return ranges;
  }, []);
};

const getHighlightedLabel = (label, indexes) => {
  const ranges = getMatchRanges(indexes);
  const highlightedLabel = [];
  let cursor = 0;

  ranges.forEach(({ start, end }, i) => {
    if (cursor < start) {
      highlightedLabel.push(label.slice(cursor, start));
    }

    highlightedLabel.push(
      <span key={i} className="mark---opJNO">
        {label.slice(start, end + 1)}
      </span>,
    );

    cursor = end + 1;
  });

  if (cursor < label.length) {
    highlightedLabel.push(label.slice(cursor));
  }

  return highlightedLabel;
};

export const fuzzySortOptions = (searchTerm, list) => {
  if (!searchTerm) return list;

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const searchableList = list.map((option) => ({
    option,
    label: normalizeSearchText(option.label),
  }));
  const results = [...fuzzysort.go(normalizedSearchTerm, searchableList, { key: 'label' })];

  // Score descending, then label ascending for ties
  results.sort((a, b) => {
    if (a.score === b.score) return a.target.localeCompare(b.target);

    return -(a.score - b.score);
  });

  return results.map(result => result.obj.option);
};

export const getFilteredOptions = fuzzySortOptions;

export const fuzzyOptionFormatter = ({ option, searchTerm }) => {
  if (!option?.label) {
    return null;
  }

  if (typeof searchTerm !== 'string' || searchTerm === '') {
    return <OptionSegment>{option.label}</OptionSegment>;
  }

  if (typeof option.label !== 'string') {
    return <OptionSegment>{option.label}</OptionSegment>;
  }

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const normalizedLabel = normalizeSearchText(option.label);
  const result = fuzzysort.single(normalizedSearchTerm, normalizedLabel);

  if (!result) {
    return <OptionSegment>{option.label}</OptionSegment>;
  }

  return (
    <OptionSegment>
      {getHighlightedLabel(option.label, fuzzysort.indexes(result))}
    </OptionSegment>
  );
};
