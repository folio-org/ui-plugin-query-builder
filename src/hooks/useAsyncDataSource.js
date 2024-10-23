import { useQuery, useQueryClient } from 'react-query';
import { useIntl } from 'react-intl';

import { useNamespace } from '@folio/stripes/core';

import { getTableMetadata } from '../QueryBuilder/ResultViewer/helpers';
import { useDebounce } from './useDebounce';
import { useEntityType } from './useEntityType';
import { QUERY_KEYS } from '../constants/query';

// temporary solution to emulate structuralSharing before migrating to react-query v4+
const structuralSharing = (queryClient, key, newData) => {
  let data = newData;
  const { data: cachedData } = queryClient.getQueryState(key) || {};

  if (cachedData?.status && cachedData?.content && !newData?.content?.length) {
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
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [namespaceKey] = useNamespace();
  const [entityKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_PREVIEW_ENTITY_TYPE });
  const [contentDataKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA });
  const [debouncedOffset, debouncedLimit] = useDebounce([offset, limit], 200);
  const debouncedContentQueryKeys = useDebounce(contentQueryKeys, 500);

  const { entityType, isContentTypeFetchedAfterMount, isEntityTypeLoading } = useEntityType({
    entityTypeDataSource,
    queryKey: entityKey,
  });

  const sharedOptions = { refetchOnWindowFocus: false, keepPreviousData: true };
  const queryKey = [namespaceKey, contentDataKey, debouncedOffset, debouncedLimit, ...debouncedContentQueryKeys];

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
    columnWidths,
  } = getTableMetadata(entityType, forcedVisibleValues, intl);

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
    columnWidths,
  };
};
