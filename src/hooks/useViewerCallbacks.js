import { useEffect } from 'react';

export const useViewerCallbacks = ({
  onSetDefaultColumns,
  defaultColumns,
  onSetDefaultVisibleColumns,
  defaultVisibleColumns,
  currentRecordsCount,
  onPreviewShown,
  defaultLimit,
  forcedVisibleValues,
  visibleColumns,
}) => {
  useEffect(() => {
    if (defaultColumns.length > 0) {
      onSetDefaultColumns?.(defaultColumns);

      if (!visibleColumns?.length) {
        onSetDefaultVisibleColumns?.(Array.from(new Set([...defaultVisibleColumns, ...forcedVisibleValues || []])));
      } else {
        onSetDefaultVisibleColumns?.((prev) => Array.from(new Set([...prev, ...forcedVisibleValues || []])));
      }
    }
  }, [currentRecordsCount]);

  useEffect(() => {
    if (currentRecordsCount) onPreviewShown?.({ currentRecordsCount, defaultLimit });
  }, [currentRecordsCount]);
};
