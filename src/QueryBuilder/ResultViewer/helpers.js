import {FormattedDate, FormattedMessage} from 'react-intl';
import { formattedLanguageName } from '@folio/stripes/components';
import { DATA_TYPES } from '../../constants/dataTypes';
import { DynamicTable } from './DynamicTable/DynamicTable';

export const formatCellValue = (value, dataType, properties, intl) => {
  if (properties?.length) {
    // Nested table case
    return <DynamicTable properties={properties} values={value} />;
  }

  switch (dataType) {
    case DATA_TYPES.BooleanType:
      return value === true ? (
          <FormattedMessage id="ui-plugin-query-builder.options.true" />
      ) : value === false ? (
          <FormattedMessage id="ui-plugin-query-builder.options.false" />
      ) : (
          ''
      );

    case DATA_TYPES.DateType:
      return value ? <FormattedDate value={value} /> : '';

    case DATA_TYPES.ArrayType:
      // Special case for instance languages
      if (Array.isArray(value)) {
        if (properties?.some((prop) => prop.property === 'instance.languages')) {
          return value.map((lang) => formattedLanguageName(lang, intl)).join(' | ');
        }
        return value.join(' | ');
      }
      return '';

    case DATA_TYPES.NumberType:
    case DATA_TYPES.IntegerType:
      return value === undefined ? '' : value;

    default:
      return value || '';
  }
};

export const getTableMetadata = (entityType, forcedVisibleValues, intl) => {
  const defaultColumns = (entityType?.columns?.map((cell) => ({
    label: cell.labelAlias,
    value: cell.name,
    disabled: false,
    readOnly: false,
    selected: cell.visibleByDefault,
    dataType: cell.dataType.dataType,
    properties: cell.dataType.itemDataType?.properties,
  })) || []).sort((a, b) => a.label.localeCompare(b.label));

  const columnMapping = defaultColumns.reduce((acc, { value, label }) => {
    acc[value] = label;
    return acc;
  }, {});

  const columnWidths = defaultColumns.reduce((acc, { value, properties }) => {
    if (properties?.length) {
      acc[value] = `${properties.length * 180}px`;
    }
    return acc;
  }, {});

  const defaultVisibleColumns = defaultColumns.filter((col) =>
      forcedVisibleValues?.includes(col.value) || col.selected
  ).map((col) => col.value);

  const formatter = defaultColumns.reduce((formatted, column) => {
    const { value, dataType, properties } = column;
    formatted[value] = (item) => formatCellValue(item[value], dataType, properties, intl);
    return formatted;
  }, {});

  return {
    defaultVisibleColumns,
    defaultColumns,
    columnMapping,
    formatter,
    columnWidths,
  };
};

