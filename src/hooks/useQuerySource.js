import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../QueryBuilder/QueryBuilder/helpers/query';
import { booleanOptions, getFieldOptions, sourceTemplate } from '../QueryBuilder/QueryBuilder/helpers/selectOptions';

export const getSourceValue = ({ mongoQuery, fieldOptions, intl, getParamsSource }) => {
  // if initial value provided, fill the source with it
  if (mongoQuery) {
    return mongoQueryToSource({
      mongoQuery,
      fieldOptions,
      booleanOptions,
      intl,
      getParamsSource,
    });
  }

  return [sourceTemplate(fieldOptions)];
};

export const useQuerySource = ({ mongoQuery, entityType, getParamsSource }) => {
  const intl = useIntl();
  const [isSourceInit, setIsSourceInit] = useState(false);
  const columns = entityType?.columns;
  const fieldOptions = getFieldOptions(columns);
  const [source, setSource] = useState([]);

  useEffect(() => {
    const setInitialValue = async () => {
      const value = await getSourceValue({ mongoQuery, fieldOptions, intl, getParamsSource });

      setSource(value);
    };

    setInitialValue();
  }, []);

  useEffect(() => {
    const setValue = async () => {
      if (entityType) {
        const value = await getSourceValue({ mongoQuery, fieldOptions, intl, getParamsSource });

        setSource(value);

        setIsSourceInit(true);
      }
    };

    setValue();
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
