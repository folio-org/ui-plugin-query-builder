import { useMemo, useState } from 'react';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../helpers/query';
import { booleanOptions, getFieldOptions, sourceTemplate } from '../helpers/selectOptions';

export const useQuerySource = (mongoQuery, entityType) => {
  const fieldOptions = getFieldOptions(entityType);

  const sourceInitialValue = useMemo(() => {
    return mongoQuery
      ? mongoQueryToSource({
        mongoQuery,
        fieldOptions,
        booleanOptions,
      })
      : [sourceTemplate(entityType)];
  }, [mongoQuery, entityType, fieldOptions]);

  const [source, setSource] = useState(sourceInitialValue);

  const queryStr = getQueryStr(source, fieldOptions);
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
