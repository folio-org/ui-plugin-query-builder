import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/query';

export const useParamsDataSource = ({ source, searchValue, getParamsSource }) => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.QUERY_PLUGIN_PARAMS_SOURCE, source, searchValue],
    queryFn: () => getParamsSource({
      entityTypeId: source?.source.entityTypeId,
      columnName: source?.source.columnName,
      searchValue,
    }),
    enabled: !!source,
  });

  return {
    data,
    isLoading,
  };
};
