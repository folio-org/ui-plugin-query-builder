import { useQuery } from 'react-query';
import { getTableMetadata } from '../QueryBuilder/ResultViewer/helpers';
import { useDebounce } from './useDebounce';

export const useAsyncDataSource = ({
  contentDataSource,
  entityTypeDataSource,
  offset,
  limit,
}) => {
  const [debouncedOffset, debouncedLimit] = useDebounce([offset, limit], 200);

  const sharedOptions = { refetchOnWindowFocus: false, keepPreviousData: true };

  const { data: recordsData, isLoading: isContentDataLoading, isFetching } = useQuery(
    ['contentData', debouncedOffset, debouncedLimit],
    () => contentDataSource({ offset: debouncedOffset, limit: debouncedLimit }),
    sharedOptions,
  );

  const { data: entityType, isLoading: isEntityTypeLoading, isFetchedAfterMount } = useQuery(
    'entityType',
    entityTypeDataSource,
    sharedOptions,
  );

  const { content: contentData, totalElements, size: pageSize } = recordsData || {};

  const { columnMapping, defaultColumns, defaultVisibleColumns } = getTableMetadata(entityType);

  return {
    contentData,
    totalElements,
    pageSize,
    isContentDataLoading,
    isFetching,
    isEntityTypeLoading,
    isFetchedAfterMount,
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
  };
};
