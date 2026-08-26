import { uniqueId } from 'lodash';
import fuzzysort from 'fuzzysort';
import { FormattedMessage } from 'react-intl';
import { OptionSegment } from '@folio/stripes/components';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { BOOLEAN_OPERATORS, OPERATORS, getDiscreteOrTextOperators } from '../../../constants/operators';
import { COLUMN_KEYS } from '../../../constants/columnKeys';
import { getOperatorLabel } from './operatorLabels';
import { getMarcOperators } from './marcFieldOperators';

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

// Builds a localized operator option for the dropdown (verbose label).
const op = (value, intl) => ({ label: getOperatorLabel(value, intl), value });

const baseLogicalOperators = (intl) => [
  op(OPERATORS.EQUAL, intl),
  op(OPERATORS.NOT_EQUAL, intl),
  op(OPERATORS.GREATER_THAN, intl),
  op(OPERATORS.LESS_THAN, intl),
];

const extendedLogicalOperators = (intl) => [
  ...baseLogicalOperators(intl),
  op(OPERATORS.GREATER_THAN_OR_EQUAL, intl),
  op(OPERATORS.LESS_THAN_OR_EQUAL, intl),
  op(OPERATORS.EMPTY, intl),
];

const ArrayOperators = (hasSourceOrValues, intl) => [
  op(OPERATORS.EQUAL, intl),
  op(OPERATORS.NOT_EQUAL, intl),
  ...(hasSourceOrValues ? [
    op(OPERATORS.IN, intl),
    op(OPERATORS.NOT_IN, intl),
  ] : [
    op(OPERATORS.CONTAINS, intl),
    op(OPERATORS.STARTS_WITH, intl),
  ]),
  op(OPERATORS.EMPTY, intl),
];

const UUIDOperators = (intl) => [
  op(OPERATORS.EQUAL, intl),
  op(OPERATORS.IN, intl),
  op(OPERATORS.NOT_IN, intl),
  op(OPERATORS.EMPTY, intl),
];

export const getFilledValues = (options) => {
  return options?.map(({ value, label }) => ({ value, label: label || value }));
};

export const hasValueOptions = ({ values, source, valueSourceApi } = {}) => (
  Boolean(values || source || valueSourceApi)
);

const stringOperators = (hasSourceOrValues, intl) => (
  getDiscreteOrTextOperators(hasSourceOrValues).map((operator) => op(operator, intl))
);

const booleanOperators = (isFromNestedField, intl) => [
  op(OPERATORS.EQUAL, intl),
  ...(isFromNestedField ? [] : [op(OPERATORS.NOT_EQUAL, intl)]),
  op(OPERATORS.EMPTY, intl),
];

const marcOperators = (fieldName, intl) => (
  getMarcOperators(fieldName).map((operator) => op(operator, intl))
);

export const getOperatorOptions = ({
  dataType,
  hasSourceOrValues,
  isFromNestedField,
  fieldName,
  intl,
}) => {
  switch (dataType) {
    case DATA_TYPES.StringType:
      return getOperatorsWithPlaceholder(stringOperators(hasSourceOrValues, intl), intl);

    case DATA_TYPES.MarcType:
      return getOperatorsWithPlaceholder(marcOperators(fieldName, intl), intl);

    case DATA_TYPES.RangedUUIDType:
    case DATA_TYPES.OpenUUIDType:
    case DATA_TYPES.StringUUIDType:
      return getOperatorsWithPlaceholder(UUIDOperators(intl), intl);

    case DATA_TYPES.IntegerType:
    case DATA_TYPES.NumberType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(intl), intl);

    case DATA_TYPES.ArrayType:
    case DATA_TYPES.JsonbArrayType:
      return getOperatorsWithPlaceholder(ArrayOperators(hasSourceOrValues, intl), intl);

    case DATA_TYPES.DateType:
    case DATA_TYPES.DateTimeType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(intl), intl);

    case DATA_TYPES.ObjectType:
      return getOperatorsWithPlaceholder(extendedLogicalOperators(intl), intl);

    case DATA_TYPES.EnumType:
      return getOperatorsWithPlaceholder(UUIDOperators(intl), intl);

    case DATA_TYPES.BooleanType:
      return getOperatorsWithPlaceholder(booleanOperators(isFromNestedField, intl), intl);

    default:
      return [];
  }
};

export const getColumnsWithProperties = (columns = []) => {
  return columns
    .reduce((acc, item) => {
      if (item.queryable && !item.hidden) {
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

export const generateRowId = () => uniqueId('qb-row-');

export const sourceTemplate = (fieldOptions = []) => ({
  [COLUMN_KEYS.BOOLEAN]: { options: booleanOptions, current: '' },
  [COLUMN_KEYS.FIELD]: { options: fieldOptions, current: '' },
  [COLUMN_KEYS.OPERATOR]: { options: [], current: '' },
  [COLUMN_KEYS.VALUE]: { current: '' },
});

// Normalize search text so dash variants match and noisy punctuation does not block fuzzy matches.
const DASH_CHARS = /[\u2010-\u2015\u2212]/g;
const IGNORED_SEARCH_CHARS = /[^\p{L}\p{N}\s-]/gu;

const normalizeDashCharacters = (value) => (
  typeof value === 'string' ? value.replace(DASH_CHARS, '-') : value
);

export const normalizeSearchText = (value) => (
  typeof value === 'string' ? normalizeDashCharacters(value).replace(IGNORED_SEARCH_CHARS, '') : value
);

const getMatchRanges = (indexes) => {
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

  ranges.forEach(({ start, end }) => {
    if (cursor < start) {
      highlightedLabel.push(label.slice(cursor, start));
    }

    highlightedLabel.push(
      <span key={`${start}-${end}`} className="mark---opJNO">
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

  // Force Selection to refresh for punctuation-only input
  if (!normalizedSearchTerm) return [...list];

  const searchableList = list.map((option) => ({
    option,
    label: normalizeDashCharacters(option.label),
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

  if (!normalizedSearchTerm) {
    return <OptionSegment>{option.label}</OptionSegment>;
  }

  const normalizedLabel = normalizeDashCharacters(option.label);
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
