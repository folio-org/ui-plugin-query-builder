import { useQuery } from 'react-query';

export const useEntityType = ({
  entityTypeDataSource,
  isInProgress,
}) => {
  const sharedOptions = { refetchOnWindowFocus: false, keepPreviousData: true };
  const {
    data: entityType,
    isLoading: isEntityTypeLoading,
  } = useQuery(
    ['entityType', isInProgress],
    entityTypeDataSource,
    {
      enabled: !isInProgress,
      ...sharedOptions,
    },
  );

  return {
    entityType,
    isEntityTypeLoading,
  };
};