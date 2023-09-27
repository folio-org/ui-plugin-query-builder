import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export const useTestQuery = ({ testQueryDataSource, onQueryTestSuccess, onQueryTestFail }) => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isTestQueryInProgress, setIsTestQueryInProgress] = useState(false);

  const {
    data: testQueryData,
    mutateAsync: testQuery,
    reset: resetTestQuery,
    isLoading: isTestQueryLoading,
  } = useMutation({
    mutationFn: ({ entityTypeId, fqlQuery }) => testQueryDataSource({ entityTypeId, fqlQuery }),
    onSuccess: onQueryTestSuccess,
    onError: () => {
      setIsTestQueryInProgress(false);
      onQueryTestFail();
    },
  });

  const { queryId } = testQueryData || {};

  return {
    queryId,
    testQuery,
    resetTestQuery,
    isTestQueryLoading,
    isPreviewLoading,
    setIsPreviewLoading,
    isTestQueryInProgress,
    setIsTestQueryInProgress,
  };
};
