import { useQuery } from 'react-query';

export const useRunQuery = ({ runQueryDataSource, testedQueryId, fqlQuery, onQueryRun }) => {
  const { data, refetch, isFetched } = useQuery(
    {
      queryKey: ['runQuery', testedQueryId, fqlQuery],
      enabled: false,
      queryFn: () => runQueryDataSource({ testedQueryId, fqlQuery }),
      onSuccess: onQueryRun,
    },
  );

  return {
    data,
    isFetched,
    runQuery: refetch,
  };
};
