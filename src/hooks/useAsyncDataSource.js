import { useCallback, useState } from 'react';
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
const DEFAULT_MAX_RETRIES = 3;

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
  const [retry, setRetry] = useState(DEFAULT_MAX_RETRIES);
  const [hasShownError, setHasShownError] = useState(false);
  const [isErrorOccurred, setIsErrorOccurred] = useState(false);
  const {
    refetchInterval = noop,
    completeExecution = noop,
    keepPreviousData = false,
  } = contentQueryOptions;

  const { entityType, isContentTypeFetchedAfterMount, isEntityTypeLoading } = useEntityType({
    entityTypeDataSource,
    queryKey: entityKey,
  });

  const queryKey = [
    namespaceKey,
    contentDataKey,
    debouncedOffset,
    debouncedLimit,
    ...debouncedContentQueryKeys,
  ];

  const showError = useCallback(
    (translation) => {
      setHasShownError((h) => {
        if (!h) {
          completeExecution();
          showCallout({
            type: 'error',
            message: intl.formatMessage({ id: translation }),
            timeout: DEFAULT_TIMEOUT,
          });
          setIsErrorOccurred(true);
        }

        return true;
      });
    },
    [completeExecution, showCallout, hasShownError],
  );

  const {
    data: recordsData,
    isLoading: isContentDataLoading,
    isFetching: isContentDataFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const data = await contentDataSource({
          offset: debouncedOffset,
          limit: debouncedLimit,
          ...queryParams,
        });

        return structuralSharing(queryClient, queryKey, data);
      } catch (e) {
        if ((await e.response.json()).code === 'read-list.contents.request.failed') {
          showError('ui-plugin-query-builder.error.needsRefresh');
          setRetry(false);
        }
        throw e;
      }
    },
    refetchInterval,
    onSuccess: (data) => {
      setRetry(DEFAULT_MAX_RETRIES);
      setHasShownError(false);
      setIsErrorOccurred(false);
      onSuccess(data);
    },
    onError: () => {
      showError('ui-plugin-query-builder.error.sww');
    },
    refetchOnWindowFocus: false,
    keepPreviousData,
    retry,
    retryDelay: 100,
  });

  const { content: contentData, totalRecords, status } = recordsData || {};

  const { columnMapping, defaultColumns, defaultVisibleColumns, formatter, columnWidths } =
    getTableMetadata(entityType, forcedVisibleValues, intl);

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
