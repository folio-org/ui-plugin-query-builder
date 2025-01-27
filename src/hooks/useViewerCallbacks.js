import { useEffect } from 'react';

export const useViewerCallbacks = ({
  onSetDefaultColumns,
  defaultColumns,
  onSetDefaultVisibleColumns,
  defaultVisibleColumns,
  currentRecordsCount,
  onPreviewShown,
  defaultLimit,
  visibleColumns,
  forcedVisibleValues,
}) => {
  useEffect(() => {
    if (defaultColumns.length > 0) {
      onSetDefaultColumns?.(defaultColumns);

      onSetDefaultVisibleColumns?.(Array.from(new Set([...defaultVisibleColumns, ...visibleColumns])));
    }
  }, [currentRecordsCount, forcedVisibleValues]);

  useEffect(() => {
    if (currentRecordsCount) onPreviewShown?.({ currentRecordsCount, defaultLimit });
  }, [currentRecordsCount]);
};
