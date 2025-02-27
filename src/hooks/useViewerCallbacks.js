import { useEffect, useMemo } from 'react';

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
  const memoizedDefaultColumns = useMemo(() => defaultColumns, [JSON.stringify(defaultColumns)]);

  useEffect(() => {
    if (defaultColumns.length > 0) {
      onSetDefaultColumns?.(memoizedDefaultColumns);

      if (!visibleColumns?.length) {
        onSetDefaultVisibleColumns?.(Array.from(new Set([...defaultVisibleColumns, ...forcedVisibleValues || []])));
      } else {
        onSetDefaultVisibleColumns?.((prev) => Array.from(new Set([...prev, ...forcedVisibleValues || []])));
      }
    }
  }, [currentRecordsCount, memoizedDefaultColumns]);

  useEffect(() => {
    if (currentRecordsCount) onPreviewShown?.({ currentRecordsCount, defaultLimit });
  }, [currentRecordsCount]);
};
