import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  getQueryStr,
  isQueryValid,
  mongoQueryToSource,
  sourceToMongoQuery,
} from '../QueryBuilder/QueryBuilder/helpers/query';
import {
  booleanOptions,
  getFieldOptions,
  sourceTemplate,
} from '../QueryBuilder/QueryBuilder/helpers/selectOptions';

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
  const [source, setSource] = useState([]);

  const fieldOptions = useMemo(() => getFieldOptions(entityType?.columns), [entityType]);
  const stringifiedFieldOptions = useMemo(() => JSON.stringify(fieldOptions), [fieldOptions]);

  const queryStr = getQueryStr(source, fieldOptions);
  const isQueryFilled = isQueryValid(source);
  const fqlQuery = sourceToMongoQuery(source);

  useEffect(() => {
    if (stringifiedFieldOptions) {
      const setInitialValue = async () => {
        const value = await getSourceValue({ initialValues, fieldOptions, intl, getParamsSource });

        setSource(value);
      };

      setInitialValue();
    }
  }, [initialValues, stringifiedFieldOptions]);

  return {
    source,
    setSource,
    queryStr,
    isQueryFilled,
    fqlQuery,
  };
};
