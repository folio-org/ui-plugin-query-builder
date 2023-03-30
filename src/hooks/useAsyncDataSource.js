import { useQuery } from 'react-query';
import { getTableMetadata } from '../QueryBuilder/ResultViewer/helpers';
import { useDebounce } from './useDebounce';

export const useAsyncDataSource = ({
  contentDataSource,
  entityTypeDataSource,
  offset,
  limit,
  onSuccess,
  isInProgress,
}) => {
  const [debouncedOffset, debouncedLimit] = useDebounce([offset, limit], 200);

  const sharedOptions = { refetchOnWindowFocus: false, keepPreviousData: true };

  const {
    data: recordsData,
    isLoading: isContentDataLoading,
    isFetching: isContentDataFetching,
    refetch,
  } = useQuery(
    ['contentData', debouncedOffset, debouncedLimit, isInProgress],
    () => contentDataSource({ offset: debouncedOffset, limit: debouncedLimit }),
    {
      ...sharedOptions,
      enabled: !isInProgress,
      onSuccess,
    },
  );

  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
    isFetchedAfterMount: isContentTypeFetchedAfterMount,
  } = useQuery(
    ['entityType', isInProgress],
    entityTypeDataSource,
    {
      enabled: !isInProgress,
      ...sharedOptions,
    },
  );

  const { content: contentData, totalRecords } = recordsData || {};

  const { columnMapping, defaultColumns, defaultVisibleColumns } = getTableMetadata(entityType);

  return {
    contentData,
    isContentDataLoading,
    isContentDataFetching,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
    totalRecords,
    refetch,
  };
};
