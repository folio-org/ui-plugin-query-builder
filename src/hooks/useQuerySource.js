import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../QueryBuilder/QueryBuilder/helpers/query';
import { booleanOptions, getFieldOptions, sourceTemplate } from '../QueryBuilder/QueryBuilder/helpers/selectOptions';

export const getSourceValue = (mongoQuery, fieldOptions, intl) => {
  return mongoQuery
    ? mongoQueryToSource({
      mongoQuery,
      fieldOptions,
      booleanOptions,
      intl,
    })
    : [sourceTemplate(fieldOptions)];
};

export const useQuerySource = ({ mongoQuery, entityType }) => {
  const intl = useIntl();
  const [isSourceInit, setIsSourceInit] = useState(false);
  const columns = entityType?.columns;
  const fieldOptions = getFieldOptions(columns);
  const [source, setSource] = useState(getSourceValue(mongoQuery, fieldOptions, intl));

  useEffect(() => {
    if (entityType) {
      setSource(getSourceValue(mongoQuery, fieldOptions, intl));

      setIsSourceInit(true);
    }
  }, [mongoQuery, entityType]);

  const queryStr = getQueryStr(source, fieldOptions);
  const isQueryFilled = isQueryValid(source);
  const fqlQuery = sourceToMongoQuery(source);

  return {
    source,
    isSourceInit,
    setSource,
    queryStr,
    isQueryFilled,
    fqlQuery,
  };
};
