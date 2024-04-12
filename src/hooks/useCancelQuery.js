import { useMutation } from 'react-query';

export const useCancelQuery = ({ cancelQueryDataSource }) => {
  const { mutateAsync: cancelQuery } = useMutation({
    mutationFn: ({ queryId }) => cancelQueryDataSource({ queryId }),
  });

  return {
    cancelQuery,
  };
};
