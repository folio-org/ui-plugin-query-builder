import { useQuery } from 'react-query';
import { useNamespace } from '@folio/stripes/core';
import { QUERY_KEYS } from '../constants/query';

export const useParamsDataSource = ({ source, searchValue, getParamsSource }) => {
  const [dataSourceKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_PARAMS_SOURCE });

  const { data, isLoading } = useQuery({
    queryKey: [dataSourceKey, source, searchValue],
    queryFn: () => getParamsSource({
      entityTypeId: source?.entityTypeId,
      columnName: source?.columnName,
      searchValue,
    }),
    keepPreviousData: true,
    enabled: !!source,
  });

  return {
    data,
    isLoading,
  };
};
