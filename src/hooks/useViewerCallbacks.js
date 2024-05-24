import { useEffect } from 'react';

export const useViewerCallbacks = ({
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

      onSetDefaultVisibleColumns?.(defaultVisibleColumns);
    }
  }, [currentRecordsCount]);

  useEffect(() => {
    if (currentRecordsCount) onPreviewShown?.({ currentRecordsCount, defaultLimit });
  }, [currentRecordsCount]);
};
