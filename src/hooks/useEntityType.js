import { useQuery } from 'react-query';

export const useEntityType = ({ entityTypeDataSource, sharedOptions = {} }) => {
  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
    isFetchedAfterMount: isContentTypeFetchedAfterMount,
  } = useQuery({
    queryKey: ['entityType'],
    queryFn: entityTypeDataSource,
    ...sharedOptions,
  });

  return {
    entityType,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
  };
};
