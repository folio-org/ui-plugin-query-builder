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
    if (defaultColumns.length > 0) {
      onSetDefaultColumns?.(defaultColumns);

      if (!visibleColumns?.length) {
        onSetDefaultVisibleColumns?.(defaultVisibleColumns);
      }
    }
  }, [currentRecordsCount]);

  useEffect(() => {
    if (currentRecordsCount) {
      onPreviewShown?.({ currentRecordsCount, defaultLimit });
    }
  }, [currentRecordsCount]);
};
