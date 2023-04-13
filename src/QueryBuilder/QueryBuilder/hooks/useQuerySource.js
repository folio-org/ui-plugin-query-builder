import { useState } from 'react';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../helpers/query';
import { booleanOptions, fieldOptions, sourceTemplate } from '../helpers/selectOptions';

export const useQuerySource = (initialValues) => {
  const sourceInitialValue = initialValues
    ? mongoQueryToSource({
      mongoQuery: initialValues,
      fieldOptions,
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
