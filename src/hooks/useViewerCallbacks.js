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
}) => {
  useEffect(() => {
    if (defaultColumns.length !== 0) {
      onSetDefaultColumns?.(defaultColumns);

      const uniqueVisibleColumns = Array.from(
        new Set([...defaultVisibleColumns, ...visibleColumns]),
      );

      onSetDefaultVisibleColumns?.(uniqueVisibleColumns);
    }
  }, [currentRecordsCount]);

  useEffect(() => {
    if (currentRecordsCount) onPreviewShown?.({ currentRecordsCount, defaultLimit });
  }, [currentRecordsCount]);
};
