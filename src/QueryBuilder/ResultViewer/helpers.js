import { Icon, Tooltip } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { DATA_TYPES } from '../../constants/dataTypes';
import { isMarcFieldName, getMarcColumnLabel } from '../QueryBuilder/helpers/marcFields';
import { formatValueByDataType } from './utils';

const MIN_CONTROLLABLE_WIDTH = 30;

// Synthetic column definitions for MARC fields that appear in the returned data but aren't declared on the
// entity type (they're recognized by name, not enumerated). Driven by the actual result data rather than the
// live query-builder state, so a MARC column only appears once its query has run and returned values — editing
// an input doesn't conjure an empty column, and a re-run that no longer returns a field drops it. Requires the
// entity type to be loaded so these don't briefly become the only columns before the declared ones arrive.
// Marked default-visible: a MARC field is in the results only because it was queried. Backend returns MARC
// values as an aggregated array, so they render like a jsonbArray (joined with " | ").
const getMarcColumns = (entityType, contentData) => {
  if (!entityType) return [];

  const declaredNames = new Set((entityType.columns ?? []).map((cell) => cell.name));
  const marcNames = new Set();

  (contentData ?? []).forEach((row) => {
    Object.keys(row ?? {}).forEach((key) => {
      if (!declaredNames.has(key) && isMarcFieldName(key)) marcNames.add(key);
    });
  });

  return Array.from(marcNames).map((value) => ({
    label: getMarcColumnLabel(value),
    value,
    disabled: false,
    // Locked visible: a synthesized MARC column only exists while it's in the returned data, and the results
    // fetch only requests the visible columns — so if the user could de-select it, it would drop out of the
    // data and the column picker with no way to re-add it. readOnly keeps its checkbox checked and un-toggleable.
    readOnly: true,
    selected: true,
    dataType: DATA_TYPES.JsonbArrayType,
    properties: undefined,
    maxWidth: undefined,
  }));
};

export const getTableMetadata = (entityType, forcedVisibleValues, intl, contentData) => {
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

  // Add synthetic columns for MARC fields present in the returned data so queried MARC fields show up in the
  // results alongside the declared columns.
  const defaultColumns = [...declaredColumns, ...getMarcColumns(entityType, contentData)];

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
