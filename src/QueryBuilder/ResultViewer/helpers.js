import { FormattedDate, FormattedMessage } from 'react-intl';
import { formattedLanguageName } from '@folio/stripes/components';
import { DATA_TYPES } from '../../constants/dataTypes';
import { DynamicTable } from './DynamicTable/DynamicTable';

const getCellValue = (row, property) => {
  // typeof check to ensure we don't try to display null/undefined as a booleans
  if (property.dataType.dataType === DATA_TYPES.BooleanType && typeof row[property.property] === 'boolean') {
    return row[property.property]
      ? <FormattedMessage id="ui-plugin-query-builder.options.true" />
      : <FormattedMessage id="ui-plugin-query-builder.options.false" />;
  }

  if (property.dataType.dataType === DATA_TYPES.DateType) {
    return row[property.property] ? <FormattedDate value={row[property.property]} /> : '';
  }

  return row[property.property];
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

  const columnMapping = defaultColumns?.reduce((acc, { value, label }) => {
    acc[value] = label;

    return acc;
  }, {});

  const columnWidths = defaultColumns?.reduce((acc, { value, properties }) => {
    if (properties?.length) {
      acc[value] = `${properties.length * 180}px`;
    }

    return acc;
  }, {});

  const defaultVisibleColumns = defaultColumns?.filter(col => !!forcedVisibleValues?.find(value => value === col.value)
      || col.selected).map(col => col.value) || [];

  const formatter = defaultColumns.reduce((formatted, column) => {
    const { value, dataType, properties } = column;

    formatted[value] = (item) => {
      const val = item[value];

      if (properties?.length) {
        const tableBodyRows = JSON.parse(val ?? '[]');

        // formatting for DynamicTable
        const formattedRows = tableBodyRows.map(row => (
          properties.map(property => getCellValue(row, property))
        ));

        return <DynamicTable properties={properties} values={formattedRows} />;
      } else if (dataType === DATA_TYPES.DateType) {
        return val ? <FormattedDate value={val} /> : '';
      } else if (dataType === DATA_TYPES.ArrayType) {
        if (value === 'instance.languages') {
          return val?.map(lang => formattedLanguageName(lang, intl)).join(' | ');
        }

        return val?.join(' | ');
      } else if (dataType === DATA_TYPES.NumberType || dataType === DATA_TYPES.IntegerType) {
        if (val === undefined) {
          return '';
        }

        return val;
      } else {
        return val || '';
      }
    };

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
