import { useMutation } from '@tanstack/react-query';

export const useTestQuery = ({ testQueryDataSource, onQueryTestSuccess, onQueryTestFail }) => {
  const { data: testQueryData, mutateAsync: testQuery, isLoading: isTestQueryLoading } = useMutation({
    mutationFn: ({ entityTypeId, fqlQuery }) => testQueryDataSource({ entityTypeId, fqlQuery }),
    onSuccess: onQueryTestSuccess,
    onError: onQueryTestFail,
  });

  return {
    testQuery,
    testQueryData,
    isTestQueryLoading,
  };
};
