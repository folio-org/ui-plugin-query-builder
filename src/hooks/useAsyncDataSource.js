import { useQuery, useQueryClient } from 'react-query';

import { useNamespace } from '@folio/stripes/core';

import { getTableMetadata } from '../QueryBuilder/ResultViewer/helpers';
import { useDebounce } from './useDebounce';
import { useEntityType } from './useEntityType';
import { QUERY_KEYS } from '../constants/query';

// temporary solution to emulate structuralSharing before migrating to react-query v4+
const structuralSharing = (queryClient, key, newData) => {
  let data = newData;
  const { data: cachedData } = queryClient.getQueryState(key) || {};

  if (cachedData?.status && cachedData?.content && !newData?.content) {
    data = {
      ...newData,
      content: cachedData.content,
    };
  }

  return data;
};

export const useAsyncDataSource = ({
  contentDataSource,
  entityTypeDataSource,
  offset,
  limit,
  queryParams,
  onSuccess,
  contentQueryOptions,
  contentQueryKeys,
  forcedVisibleValues,
}) => {
  const queryClient = useQueryClient();
  const [namespaceKey] = useNamespace();
  const [entityKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_PREVIEW_ENTITY_TYPE });
  const [contentDataKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA });
  const [debouncedOffset, debouncedLimit] = useDebounce([offset, limit], 200);

  const { entityType, isContentTypeFetchedAfterMount, isEntityTypeLoading } = useEntityType({
    entityTypeDataSource,
    queryKey: entityKey,
  });

  const sharedOptions = { refetchOnWindowFocus: false, keepPreviousData: true };
  const queryKey = [namespaceKey, contentDataKey, debouncedOffset, debouncedLimit, ...contentQueryKeys];

  const {
    data: recordsData,
    isLoading: isContentDataLoading,
    isFetching: isContentDataFetching,
    refetch,
  } = useQuery(
    {
      queryKey,
      queryFn: async () => {
        const data = await contentDataSource({
          offset: debouncedOffset,
          limit: debouncedLimit,
          ...queryParams,
        });

        return structuralSharing(queryClient, queryKey, data);
      },
      onSuccess,
      ...sharedOptions,
      ...contentQueryOptions,
    },
  );

  const { content: contentData, totalRecords, status } = recordsData || {};

  const {
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
    formatter,
  } = getTableMetadata(entityType, forcedVisibleValues);

  return {
    contentData,
    entityType,
    isContentDataLoading,
    isContentDataFetching,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
    totalRecords,
    status,
    refetch,
    formatter,
  };
};
