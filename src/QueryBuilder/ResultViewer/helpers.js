import { FormattedDate } from 'react-intl';
import { DATA_TYPES } from '../../constants/dataTypes';
import { DynamicTable } from './DynamicTable/DynamicTable';

export const getTableMetadata = (entityType, forcedVisibleValues) => {
  const defaultColumns = entityType?.columns?.map((cell) => ({
    label: cell.labelAlias,
    value: cell.name,
    disabled: false,
    readOnly: false,
    selected: cell.visibleByDefault,
    dataType: cell.dataType.dataType,
    properties: cell.dataType.itemDataType?.properties,
  })) || [];

  const columnMapping = defaultColumns?.reduce((acc, { value, label }) => {
    acc[value] = label;

    return acc;
  }, {});

  const defaultVisibleColumns = defaultColumns?.filter(col => !!forcedVisibleValues?.find(value => value === col.value)
      || col.selected).map(col => col.value) || [];

  const formatter = defaultColumns.reduce((formatted, column) => {
    const { value, dataType, properties } = column;

    formatted[value] = (item) => {
      if (properties?.length) {
        return <DynamicTable properties={properties} values={item[value]} />;
      } else if (dataType === DATA_TYPES.DateType) {
        return item[value] ? <FormattedDate value={item[value]} /> : '';
      } else if (dataType === DATA_TYPES.ArrayType) {
        return item[value]?.join(' | ');
      } else if (dataType === DATA_TYPES.NumberType || dataType === DATA_TYPES.IntegerType) {
        if (item[value] === undefined) {
          return '';
        }

        return item[value];
      } else {
        // If value is empty we will return empty string
        // instead of undefined
        return item[value] || '';
      }
    };

    return formatted;
  }, {});

  return {
    defaultVisibleColumns,
    defaultColumns,
    columnMapping,
    formatter,
  };
};
