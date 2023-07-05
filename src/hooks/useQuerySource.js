import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../QueryBuilder/QueryBuilder/helpers/query';
import { booleanOptions, getFieldOptions, sourceTemplate } from '../QueryBuilder/QueryBuilder/helpers/selectOptions';

export const getSourceValue = ({ initialValues, fieldOptions, intl, getParamsSource }) => {
  // if initial value provided, fill the source with it
  if (initialValues) {
    return mongoQueryToSource({
      initialValues,
      fieldOptions,
      booleanOptions,
      intl,
      getParamsSource,
    });
  }

  return [sourceTemplate(fieldOptions)];
};

export const useQuerySource = ({ initialValues, entityType, getParamsSource }) => {
  const intl = useIntl();
  const [isSourceInit, setIsSourceInit] = useState(false);
  const columns = entityType?.columns;
  const fieldOptions = getFieldOptions(columns);
  const [source, setSource] = useState([]);

  useEffect(() => {
    const setInitialValue = async () => {
      const value = await getSourceValue({ initialValues, fieldOptions, intl, getParamsSource });

      setSource(value);
    };

    if (fieldOptions && !isSourceInit) {
      setInitialValue().then(() => setIsSourceInit(true));
    }
  }, [initialValues, fieldOptions, isSourceInit]);

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
