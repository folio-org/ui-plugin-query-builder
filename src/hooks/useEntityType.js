import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/query';

export const useEntityType = ({ entityTypeDataSource, sharedOptions = {} }) => {
  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
    isFetchedAfterMount: isContentTypeFetchedAfterMount,
  } = useQuery({
    queryKey: [QUERY_KEYS.QUERY_PLUGIN_ENTITY_TYPE],
    queryFn: entityTypeDataSource,
    ...sharedOptions,
  });

  return {
    entityType,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
  };
};
