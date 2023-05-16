import { useMutation } from '@tanstack/react-query';

export const useCancelQuery = ({ cancelQueryDataSource }) => {
  const { mutateAsync: cancelQuery } = useMutation({
    mutationFn: ({ queryId }) => cancelQueryDataSource({ queryId }),
  });

  return {
    cancelQuery,
  };
};
