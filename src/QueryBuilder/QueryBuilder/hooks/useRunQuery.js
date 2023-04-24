import { useMutation } from 'react-query';

export const useRunQuery = ({ runQueryDataSource, onQueryRunSuccess, onQueryRunFail }) => {
  const { mutateAsync: runQuery, isLoading: isRunQueryLoading } = useMutation({
    mutationFn: ({ entityTypeId, fqlQuery }) => runQueryDataSource({ entityTypeId, fqlQuery }),
    onSuccess: onQueryRunSuccess,
    onError: onQueryRunFail,
  });

  return {
    isRunQueryLoading,
    runQuery,
  };
};
