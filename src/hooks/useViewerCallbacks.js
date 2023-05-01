import { useEffect } from 'react';

export const useViewerCallbacks = ({
  isContentTypeFetchedAfterMount,
  onSetDefaultColumns,
  defaultColumns,
  onSetDefaultVisibleColumns,
  defaultVisibleColumns,
  currentRecordsCount,
  onPreviewShown,
  defaultLimit,
}) => {
  useEffect(() => {
    if (isContentTypeFetchedAfterMount) {
      onSetDefaultColumns?.(defaultColumns);
      onSetDefaultVisibleColumns?.(defaultVisibleColumns);
    }
  }, [isContentTypeFetchedAfterMount]);

  useEffect(() => {
    if (currentRecordsCount) onPreviewShown?.({ currentRecordsCount, defaultLimit });
  }, [currentRecordsCount]);
};
