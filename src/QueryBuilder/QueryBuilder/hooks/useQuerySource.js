import { useEffect, useState } from 'react';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../helpers/query';
import { booleanOptions, getFieldOptions, sourceTemplate } from '../helpers/selectOptions';

const getSourceValue = (mongoQuery, entityType, fieldOptions) => {
  return mongoQuery
    ? mongoQueryToSource({
      mongoQuery,
      fieldOptions,
      booleanOptions,
    })
    : [sourceTemplate(entityType)];
};

export const useQuerySource = (mongoQuery, entityType) => {
  const fieldOptions = getFieldOptions(entityType);
  const [source, setSource] = useState(getSourceValue(mongoQuery, entityType, fieldOptions));

  useEffect(() => {
    if (entityType) {
      setSource(getSourceValue(mongoQuery, entityType, fieldOptions));
    }
  }, [mongoQuery, entityType]);

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
