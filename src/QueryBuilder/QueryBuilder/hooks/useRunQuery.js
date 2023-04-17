import { useQuery } from 'react-query';

export const useRunQuery = ({ runQuerySource, testedQueryId, fqlQuery, onQueryRun }) => {
  const { data, refetch, isFetched } = useQuery(
    {
      queryKey: ['runQuery', testedQueryId, fqlQuery],
      enabled: false,
      queryFn: () => runQuerySource(testedQueryId, fqlQuery),
      onSuccess: onQueryRun,
    },
  );

  return {
    data,
    isFetched,
    runQuery: refetch,
  };
};
