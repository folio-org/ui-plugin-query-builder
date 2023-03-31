import { useQuery } from 'react-query';
import { delayedResponse } from '../../../../test/jest/helpers';
import { content } from '../../../../test/jest/data/content';
import { entityType } from '../../../../test/jest/data/entityType';

export const useTestQuery = () => {
  const { data, isFetching, refetch, isFetched } = useQuery(
    {
      queryKey: ['testQueryPreview'],
      enabled: false,
      queryFn: () => delayedResponse(3000, { content, entityType }),
    },
  );

  return {
    data,
    isFetched,
    isTestQueryFetching: isFetching,
    testQuery: refetch,
  };
};
