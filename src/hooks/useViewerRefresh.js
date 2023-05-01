import { useEffect } from 'react';

export const useViewerRefresh = ({
  refreshTrigger,
  offset,
  defaultOffset,
  defaultLimit,
  refetch,
  changePage,
}) => {
  useEffect(() => {
    if (refreshTrigger) {
      if (offset === defaultOffset) {
        refetch();
      } else {
        changePage({ offset: defaultOffset, limit: defaultLimit });
      }
    }
  }, [refreshTrigger]);
};
