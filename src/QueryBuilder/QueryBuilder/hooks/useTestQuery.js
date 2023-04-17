import { useQuery } from 'react-query';

export const useTestQuery = ({ testQuerySource, fqlQuery, onQueryTested }) => {
  const { data, isFetching, refetch, isFetched } = useQuery(
    {
      queryKey: ['testQueryPreview', fqlQuery],
      enabled: false,
      queryFn: () => testQuerySource(fqlQuery),
      onSuccess: onQueryTested,
    },
  );

  return {
    data,
    isFetched,
    isTestQueryFetching: isFetching,
    testQuery: refetch,
  };
};
