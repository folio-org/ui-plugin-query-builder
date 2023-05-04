import { useMutation } from '@tanstack/react-query';

export const useRunQuery = ({ runQueryDataSource, onQueryRunSuccess, onQueryRunFail }) => {
  const { mutateAsync: runQuery, isLoading: isRunQueryLoading } = useMutation({
    mutationFn: ({ queryId, fqlQuery }) => runQueryDataSource({ queryId, fqlQuery }),
    onSuccess: onQueryRunSuccess,
    onError: onQueryRunFail,
  });

  return {
    isRunQueryLoading,
    runQuery,
  };
};