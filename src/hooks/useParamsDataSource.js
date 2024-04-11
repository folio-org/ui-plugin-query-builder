import { useQuery } from '@tanstack/react-query';
import { useNamespace } from '@folio/stripes/core';
import { QUERY_KEYS } from '../constants/query';

export const useParamsDataSource = ({ source, searchValue, getParamsSource }) => {
  const [namespaceKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_PARAMS_SOURCE });

  const { data, isLoading } = useQuery({
    queryKey: [namespaceKey, source, searchValue],
    queryFn: () => getParamsSource({
      entityTypeId: source?.entityTypeId,
      columnName: source?.columnName,
      searchValue,
    }),
    enabled: !!source,
  });

  return {
    data,
    isLoading,
  };
};
