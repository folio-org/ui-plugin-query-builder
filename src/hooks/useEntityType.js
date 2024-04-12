import { useQuery } from '@tanstack/react-query';

import { useNamespace } from '@folio/stripes/core';

import { QUERY_KEYS } from '../constants/query';

export const useEntityType = ({ entityTypeDataSource, sharedOptions = {} }) => {
  const [namespaceKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_ENTITY_TYPE });

  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
    isFetchedAfterMount: isContentTypeFetchedAfterMount,
  } = useQuery({
    queryKey: [namespaceKey],
    queryFn: entityTypeDataSource,
    ...sharedOptions,
  });

  return {
    entityType,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
  };
};
