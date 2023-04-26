import { useQuery } from '@tanstack/react-query';

export const useEntityType = ({ entityTypeDataSource, sharedOptions = {} }) => {
  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
    isFetchedAfterMount: isContentTypeFetchedAfterMount,
  } = useQuery({
    queryKey: ['queryPluginEntityType'],
    queryFn: entityTypeDataSource,
    ...sharedOptions,
  });

  return {
    entityType,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
  };
};
