import { useEffect } from 'react';

export const useViewerCallbacks = ({
  visibleColumns,
  onSetDefaultColumns,
  defaultColumns,
  onSetDefaultVisibleColumns,
  defaultVisibleColumns,
  currentRecordsCount,
  onPreviewShown,
  defaultLimit,
}) => {
  useEffect(() => {
    if (defaultColumns.length !== 0) {
      onSetDefaultColumns?.(defaultColumns);
      // only set visible columns if we're building a new query from scratch
      if (visibleColumns.length === 0) {
        onSetDefaultVisibleColumns?.(defaultVisibleColumns);
      }
    }
  }, [currentRecordsCount]);

  useEffect(() => {
    if (currentRecordsCount) onPreviewShown?.({ currentRecordsCount, defaultLimit });
  }, [currentRecordsCount]);
};
