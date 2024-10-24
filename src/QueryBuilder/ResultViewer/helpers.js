import { FormattedDate } from 'react-intl';
import { formattedLanguageName } from '@folio/stripes/components';
import { DATA_TYPES } from '../../constants/dataTypes';
import { DynamicTable } from './DynamicTable/DynamicTable';

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
        return <DynamicTable properties={properties} values={val} />;
      } else if (dataType === DATA_TYPES.DateType) {
        return val ? <FormattedDate value={val} /> : '';
      } else if (dataType === DATA_TYPES.ArrayType) {
        // Special case for instance languages, to format them as translated strings
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
        // If value is empty we will return empty string
        // instead of undefined
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
