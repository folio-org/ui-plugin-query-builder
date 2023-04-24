import { useQuery } from 'react-query';
import { getTableMetadata } from '../QueryBuilder/ResultViewer/helpers';
import { useDebounce } from './useDebounce';

export const useAsyncDataSource = ({
  contentDataSource,
  entityTypeDataSource,
  offset,
  limit,
  queryParams,
  onSuccess,
  refetchInterval,
}) => {
  const [debouncedOffset, debouncedLimit] = useDebounce([offset, limit], 200);

  const sharedOptions = { refetchOnWindowFocus: false, keepPreviousData: true };

  const {
    data: recordsData,
    isLoading: isContentDataLoading,
    isFetching: isContentDataFetching,
    refetch,
  } = useQuery(
    ['contentData', debouncedOffset, debouncedLimit, queryParams],
    () => contentDataSource({
      offset: debouncedOffset,
      limit: debouncedLimit,
      ...queryParams,
    }),
    {
      ...sharedOptions,
      onSuccess,
      refetchInterval,
    },
  );

  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
    isFetchedAfterMount: isContentTypeFetchedAfterMount,
  } = useQuery(
    ['entityType'],
    entityTypeDataSource,
    {
      ...sharedOptions,
    },
  );

  const { content: contentData, totalRecords, status } = recordsData || {};

  const { columnMapping, defaultColumns, defaultVisibleColumns } = getTableMetadata(entityType);

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
  };
};
