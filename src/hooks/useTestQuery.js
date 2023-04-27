import { useMutation } from '@tanstack/react-query';

export const useTestQuery = ({ testQueryDataSource, onQueryTestSuccess, onQueryTestFail }) => {
  const {
    data: testQueryData,
    mutateAsync: testQuery,
    reset: resetTestQuery,
    isLoading: isTestQueryLoading,
  } = useMutation({
    mutationFn: ({ entityTypeId, fqlQuery }) => testQueryDataSource({ entityTypeId, fqlQuery }),
    onSuccess: onQueryTestSuccess,
    onError: onQueryTestFail,
  });

  const { queryId } = testQueryData || {};

  return {
    queryId,
    testQuery,
    resetTestQuery,
    isTestQueryLoading,
  };
};
