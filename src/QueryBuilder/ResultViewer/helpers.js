export const getTableMetadata = (entityType) => {
  const defaultColumns = entityType?.columns?.map((cell) => ({
    label: cell.labelAlias,
    value: cell.name,
    disabled: false,
    readOnly: false,
    selected: cell.visibleByDefault,
  })) || [];

  const columnMapping = defaultColumns?.reduce((acc, { value, label }) => {
    acc[value] = label;

    return acc;
  }, {});

  const defaultVisibleColumns = defaultColumns?.filter(col => col.selected).map(col => col.value) || [];

  return {
    defaultVisibleColumns,
    defaultColumns,
    columnMapping,
  };
};
