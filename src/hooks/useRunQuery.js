import { useMutation } from '@tanstack/react-query';

export const useRunQuery = ({ runQueryDataSource, onQueryRunSuccess, onQueryRunFail }) => {
  const { mutateAsync: runQuery, isLoading: isRunQueryLoading } = useMutation({
    mutationFn: ({ queryId, fqlQuery, entityTypeId }) => runQueryDataSource({ entityTypeId, fqlQuery, queryId }),
    onSuccess: onQueryRunSuccess,
    onError: onQueryRunFail,
  });

  return {
    isRunQueryLoading,
    runQuery,
  };
};
