import { useState, useCallback } from 'react';

export const usePagination = ({ defaultOffset, defaultLimit }) => {
  const [pagination, setPagination] = useState({ offset: defaultOffset, limit: defaultLimit });

  const changePage = useCallback((newPagination) => {
    setPagination((p) => ({ ...p, ...newPagination }));
  }, []);

  return {
    ...pagination,
    changePage,
  };
};
