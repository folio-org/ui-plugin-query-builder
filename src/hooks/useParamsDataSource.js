import { useQuery } from 'react-query';

export const useParamsDataSource = ({ source, searchValue, getParamsSource }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['getParamsSource', source, searchValue],
    queryFn: () => getParamsSource({
      entityTypeId: source?.source.entityTypeId,
      source: source?.source.columnName,
      search: searchValue,
    }),
    enabled: !!source,
  });

  return {
    data,
    isLoading,
  };
};
