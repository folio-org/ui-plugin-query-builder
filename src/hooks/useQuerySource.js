import { useContext, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import useTenantTimezone from './useTenantTimezone';
import {
  getQueryStr,
  isQueryValid,
  getSourceValue,
  sourceToFqlQuery,
} from '../QueryBuilder/QueryBuilder/helpers/query';
import {
  generateRowId,
  getFieldOptions,
} from '../QueryBuilder/QueryBuilder/helpers/selectOptions';
import { RootContext } from '../context/RootContext';

export const useQuerySource = ({ initialValues, entityType }) => {
  const intl = useIntl();
  const [source, setSource] = useState([]);

  const { getDataOptions, getDataOptionsWithFetching } = useContext(RootContext);

  const fieldOptions = useMemo(() => getFieldOptions(entityType?.columns), [entityType]);
  const stringifiedFieldOptions = useMemo(() => JSON.stringify(fieldOptions), [fieldOptions]);

  const { tenantTimezone: timezone } = useTenantTimezone();
  const queryStr = getQueryStr(source, fieldOptions, intl, timezone, getDataOptions);
  const isQueryFilled = isQueryValid(source);
  const fqlQuery = sourceToFqlQuery(source);

  useEffect(() => {
    if (stringifiedFieldOptions) {
      const setInitialValue = async () => {
        const value = await getSourceValue({
          initialValues,
          fieldOptions,
          intl,
          getDataOptionsWithFetching,
          originalEntityTypeId: entityType?.id,
        });

        // Attach a stable id to each seeded row (default or loaded) so rows are keyed by identity, not index.
        // filter(Boolean) drops a possible null row (getSourceValue returns [null] for a single deleted/
        // unsupported condition) so it never reaches the id-map or the rendered list.
        setSource(value.filter(Boolean).map((row) => ({ ...row, id: generateRowId() })));
      };

      setInitialValue();
    }
  }, [initialValues, stringifiedFieldOptions, entityType?.id]);

  return {
    source,
    setSource,
    queryStr,
    isQueryFilled,
    fqlQuery,
  };
};
