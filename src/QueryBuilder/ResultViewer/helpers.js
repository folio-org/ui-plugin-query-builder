import { Icon, Tooltip } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { DATA_TYPES } from '../../constants/dataTypes';
import { isMarcFieldName, getMarcColumnLabel } from '../QueryBuilder/helpers/marcFields';
import { formatValueByDataType } from './utils';

const MIN_CONTROLLABLE_WIDTH = 30;

// Synthetic column definitions for MARC fields referenced by a query but not declared on the entity type (they're
// recognized by name, not enumerated). Without these a queried MARC field wouldn't appear as a result column. The
// backend returns MARC values as an aggregated array, so they render like a jsonbArray (joined with " | ").
const getMarcColumns = (entityType, forcedVisibleValues) => {
  const existingNames = new Set((entityType?.columns ?? []).map((cell) => cell.name));

  return (forcedVisibleValues ?? [])
    .filter((value) => value && !existingNames.has(value) && isMarcFieldName(value))
    .map((value) => ({
      label: getMarcColumnLabel(value),
      value,
      disabled: false,
      readOnly: false,
      selected: false,
      dataType: DATA_TYPES.JsonbArrayType,
      properties: undefined,
      maxWidth: undefined,
    }));
};

export const getTableMetadata = (entityType, forcedVisibleValues, intl) => {
  // Exclude hidden columns from the table/column-picker. The entity type may include hidden columns (e.g. when
  // fetched with includeHidden so MARC capability can be detected); they are internal metadata/placeholders and
  // should be neither shown nor offered as toggleable columns.
  const declaredColumns = (entityType?.columns?.filter((cell) => !cell.hidden).map((cell) => ({
    label: cell.labelAlias,
    value: cell.name,
    disabled: false,
    readOnly: false,
    selected: cell.visibleByDefault,
    dataType: cell.dataType.dataType,
    properties: cell.dataType.itemDataType?.properties,
    maxWidth: cell.maxColumnWidth,
  })) || []);

  // Add synthetic columns for MARC fields used in the query so they show up in the results (forcedVisibleValues
  // makes any queried field default-visible, but only if it's a known column).
  const defaultColumns = [...declaredColumns, ...getMarcColumns(entityType, forcedVisibleValues)];

  const columnMapping = defaultColumns?.reduce((acc, { value, label }) => {
    acc[value] = label;

    return acc;
  }, {});

  const columnWidths = defaultColumns?.reduce((acc, { value, properties, maxWidth }) => {
    if (maxWidth) {
      acc[value] = { min: MIN_CONTROLLABLE_WIDTH, max: maxWidth };
    }

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

      return formatValueByDataType(
        val,
        dataType,
        properties,
        intl,
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
