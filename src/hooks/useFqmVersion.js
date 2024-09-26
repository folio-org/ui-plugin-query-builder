import { useNamespace, useOkapiKy } from '@folio/stripes/core';
import { useQuery } from 'react-query';
import { QUERY_KEYS } from '../constants/query';

export function useFqmVersion() {
  const ky = useOkapiKy();
  const [queryKey] = useNamespace({ key: QUERY_KEYS.FQM_VERSION });

  return (
    useQuery({
      queryKey: [queryKey],
      queryFn: () => ky.get('fqm/version').text(),
    }).data ?? '0'
  );
}
