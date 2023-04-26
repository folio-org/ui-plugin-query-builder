import { useEffect, useMemo, useState } from 'react';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../helpers/query';
import { booleanOptions, getFieldOptions, sourceTemplate } from '../helpers/selectOptions';

export const useQuerySource = (initialValues, entityType) => {
  const sourceInitialValue = useMemo(() => {
    return initialValues
      ? mongoQueryToSource({
        mongoQuery: initialValues,
        fieldOptions: getFieldOptions(entityType),
        booleanOptions,
      })
      : [sourceTemplate(entityType)];
  }, [initialValues, entityType]);

  const [source, setSource] = useState(sourceInitialValue);

  useEffect(() => { setSource(sourceInitialValue); }, [sourceInitialValue]);

  const queryStr = getQueryStr(source);
  const isQueryFilled = isQueryValid(source);
  const fqlQuery = sourceToMongoQuery(source);

  return {
    source,
    setSource,
    queryStr,
    isQueryFilled,
    fqlQuery,
  };
};
