import { Icon, Tooltip } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { DynamicTable } from './DynamicTable';
import { formatValueByDataType } from './utils';

const INSTANCE_LANGUAGE_FIELDS = new Set(['instance.languages', 'instances.languages']);

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
            dataType: prop.dataType?.dataType,
            styles: { width: '180px', minWidth: '180px' },
          }));

        return <DynamicTable columns={columns} values={values} />;
      }

      return formatValueByDataType(
        val,
        dataType,
        intl,
        { isInstanceLanguages: INSTANCE_LANGUAGE_FIELDS.has(value) },
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

export function handleDeletedRecords(data, columns) {
  if (!data) {
    return data;
  }

  return data.map((row, i) => {
    if (row._deleted !== true) {
      return row;
    }

    // must iterate through columns to get the first non-filled column as we
    // want to add a special "Deleted" marker only once, and some columns (IDs)
    // will still exist even on deleted records
    let firstEmptyColumnMarked = false;

    for (const col of columns) {
      if (!(col in row) && !firstEmptyColumnMarked) {
        row[col] = (
          <div>
            <FormattedMessage id="ui-plugin-query-builder.viewer.deletedRecord.rowLabel" />
            &nbsp;
            <Tooltip
              id={`query-builder-deleted-record-tooltip-${i}`}
              text={<FormattedMessage id="ui-plugin-query-builder.viewer.deletedRecord.tooltip" />}
            >
              {({ ref, ariaIds }) => (
                <Icon ref={ref} aria-labelledby={ariaIds.text} readOnly icon="info" size="small" />
              )}
            </Tooltip>
          </div>
        );
        firstEmptyColumnMarked = true;
      }
      row[col] = row[col] ?? (
        <FormattedMessage id="ui-plugin-query-builder.viewer.deletedRecord.emptyField" />
      );
    }

    return row;
  });
}
