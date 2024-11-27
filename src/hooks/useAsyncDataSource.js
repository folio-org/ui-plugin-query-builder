import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useIntl } from 'react-intl';
import { noop } from 'lodash';

import { useNamespace } from '@folio/stripes/core';
import { useShowCallout } from '@folio/stripes-acq-components';

import { getTableMetadata } from '../QueryBuilder/ResultViewer/helpers';
import { useDebounce } from './useDebounce';
import { useEntityType } from './useEntityType';
import { QUERY_KEYS } from '../constants/query';

const DEFAULT_TIMEOUT = 6000;

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
  onSuccess = noop,
  contentQueryOptions,
  contentQueryKeys,
  forcedVisibleValues,
}) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const showCallout = useShowCallout();
  const [namespaceKey] = useNamespace();
  const [entityKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_PREVIEW_ENTITY_TYPE });
  const [contentDataKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA });
  const [debouncedOffset, debouncedLimit] = useDebounce([offset, limit], 200);
  const debouncedContentQueryKeys = useDebounce(contentQueryKeys, 500);
  const [retryCount, setRetryCount] = useState(0);
  const [hasShownError, setHasShownError] = useState(false);
  const [isErrorOccurred, setIsErrorOccurred] = useState(false);
  const maxRetries = 3;
  const { refetchInterval = noop, completeExecution = noop, keepPreviousData = false } = contentQueryOptions;

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
      refetchInterval: (query) => {
        if (retryCount === maxRetries) {
          if (!hasShownError) {
            completeExecution();
            showCallout({
              type: 'error',
              message: intl.formatMessage({ id: 'ui-plugin-query-builder.error.sww' }),
              timeout: DEFAULT_TIMEOUT,
            });
            setHasShownError(true);
            setIsErrorOccurred(true);
          }

          return 0;
        }

        return refetchInterval(query);
      },
      onSuccess: (data) => {
        setRetryCount(0);
        setHasShownError(false);
        setIsErrorOccurred(false);
        onSuccess(data);
      },
      onError: () => {
        setRetryCount((prev) => prev + 1);
      },
      keepPreviousData,
      ...sharedOptions,
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
    isErrorOccurred,
  };
};
