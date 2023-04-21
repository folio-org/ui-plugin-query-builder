import { useState } from 'react';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../helpers/query';
import { booleanOptions, getFieldOptions, sourceTemplate } from '../helpers/selectOptions';

export const useQuerySource = (initialValues, entityType) => {
  const sourceInitialValue = initialValues
    ? mongoQueryToSource({
      mongoQuery: initialValues,
      fieldOptions: getFieldOptions(entityType),
      booleanOptions,
    })
    : [sourceTemplate];

  const [source, setSource] = useState(sourceInitialValue);

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
