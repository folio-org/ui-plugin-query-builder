import { DynamicTable } from './DynamicTable';
import { formatValueByDataType } from './utils';

export const getTableMetadata = (entityType, forcedVisibleValues, intl) => {
  const defaultColumns = (entityType?.columns?.map((cell) => ({
    label: cell.labelAlias,
    value: cell.name,
    disabled: false,
    readOnly: false,
    selected: cell.visibleByDefault,
    dataType: cell.dataType.dataType,
    properties: cell.dataType.itemDataType?.properties,
  })) || []);

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
        const values = JSON.parse(val ?? null);
        const columns = properties
          .map(prop => ({
            id: prop.property,
            name: prop.labelAlias,
            dataType: prop.dataType.dataType,
            styles: { width: '180px', minWidth: '180px' },
          }));

        return <DynamicTable columns={columns} values={values} />;
      }

      return formatValueByDataType(
        val,
        dataType,
        intl,
        { isInstanceLanguages: value === 'instance.languages' },
      );
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
