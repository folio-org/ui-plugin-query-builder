import { FormattedDate } from 'react-intl';
import { DATA_TYPES } from '../../constants/dataTypes';

export const getTableMetadata = (entityType) => {
  const defaultColumns = entityType?.columns?.map((cell) => ({
    label: cell.labelAlias,
    value: cell.name,
    disabled: false,
    readOnly: false,
    selected: cell.visibleByDefault,
    dataType: cell.dataType.dataType,
  })) || [];

  const columnMapping = defaultColumns?.reduce((acc, { value, label }) => {
    acc[value] = label;

    return acc;
  }, {});

  const defaultVisibleColumns = defaultColumns?.filter(col => col.selected).map(col => col.value) || [];
  const formatter = defaultColumns.reduce((formatted, column) => {
    const { value, dataType } = column;

    formatted[value] = (item) => {
      if (dataType === DATA_TYPES.DateType) {
        return <FormattedDate value={item[value]} />;
      } else if (dataType === DATA_TYPES.ArrayType) {
        return item[value]?.join(' | ');
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
