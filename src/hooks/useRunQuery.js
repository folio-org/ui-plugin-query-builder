import { useMutation } from '@tanstack/react-query';

export const useRunQuery = ({ runQueryDataSource, onQueryRunSuccess, onQueryRunFail }) => {
  const { mutateAsync: runQuery, isLoading: isRunQueryLoading } = useMutation({
    mutationFn: ({ queryId, fqlQuery, userFriendlyQuery }) => runQueryDataSource({
      queryId,
      fqlQuery,
      userFriendlyQuery,
    }),
    onSuccess: onQueryRunSuccess,
    onError: onQueryRunFail,
  });

  return {
    isRunQueryLoading,
    runQuery,
  };
};
