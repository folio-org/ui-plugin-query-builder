import { useQuery } from 'react-query';

export const useEntityType = ({ entityTypeDataSource, queryKey, sharedOptions = {} }) => {
  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
    isFetching: isEntityTypeFetching,
    isFetchedAfterMount: isContentTypeFetchedAfterMount,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: entityTypeDataSource,
    ...sharedOptions,
  });

  return {
    entityType,
    isEntityTypeLoading,
    isEntityTypeFetching,
    isContentTypeFetchedAfterMount,
  };
};
