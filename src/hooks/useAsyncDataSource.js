import { useQuery } from '@tanstack/react-query';

import { useNamespace } from '@folio/stripes/core';

import { getTableMetadata } from '../QueryBuilder/ResultViewer/helpers';
import { useDebounce } from './useDebounce';
import { useEntityType } from './useEntityType';
import { QUERY_KEYS } from '../constants/query';

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
  const [namespaceKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA });
  const [debouncedOffset, debouncedLimit] = useDebounce([offset, limit], 200);

  const sharedOptions = { refetchOnWindowFocus: false, keepPreviousData: true };

  const { entityType, isContentTypeFetchedAfterMount, isEntityTypeLoading } = useEntityType({
    entityTypeDataSource,
    sharedOptions,
  });

  const {
    data: recordsData,
    isLoading: isContentDataLoading,
    isFetching: isContentDataFetching,
    refetch,
  } = useQuery(
    {
      queryKey: [namespaceKey, debouncedOffset, debouncedLimit, ...contentQueryKeys],
      queryFn: () => contentDataSource({
        offset: debouncedOffset,
        limit: debouncedLimit,
        ...queryParams,
      }),
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
