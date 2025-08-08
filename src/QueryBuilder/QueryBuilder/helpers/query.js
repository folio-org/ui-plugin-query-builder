import { Loading } from '@folio/stripes/components';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { COLUMN_KEYS } from '../../../constants/columnKeys';
import { BOOLEAN_OPERATORS, BOOLEAN_OPERATORS_MAP, OPERATORS } from '../../../constants/operators';
import { RootContext } from '../../../context/RootContext';
import useTenantTimezone from '../../../hooks/useTenantTimezone';
import { findLabelByValue } from '../../ResultViewer/utils';
import {
  booleanOptions,
  getFieldOptions,
  getOperatorOptions,
  sourceTemplate,
} from './selectOptions';
import upgradeInitialValues from './upgradeInitialValues';
import { valueBuilder } from './valueBuilder';
import { ORGANIZATIONS_TYPES } from '../../../constants/dataTypes';

export const DEFAULT_PREVIEW_INTERVAL = 3000;

const getLabeledValue = (value, dataOptions) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    return value;
  }

  const matchedOption = dataOptions?.find(option => option.value === value);

  return matchedOption ? matchedOption.label : value;
};

export const getQueryStr = (rows, fieldOptions, intl, timezone, getDataOptions) => {
  return rows.reduce((str, row, index) => {
    const bool = row[COLUMN_KEYS.BOOLEAN].current;
    const field = row[COLUMN_KEYS.FIELD].current;
    const operator = row[COLUMN_KEYS.OPERATOR].current;
    const value = row[COLUMN_KEYS.VALUE].current;
    const labeledValue = getLabeledValue(value, getDataOptions(field));
    const builtValue = valueBuilder({ value: labeledValue, field, operator, fieldOptions, intl, timezone });

    const queryPiece = `(${findLabelByValue(row[COLUMN_KEYS.FIELD], field)} ${operator} ${builtValue})`;

    // if there aren't values yet - return empty string
    if (![bool, field, operator, value].some(val => Boolean(val))) {
      return '';
    }

    // if there is a boolean operator and it's not the first row - add it to the query
    if (bool && index > 0) {
      str += ` ${BOOLEAN_OPERATORS_MAP[bool] || ''} ${queryPiece}`;
    } else {
      str += queryPiece;
    }

    return str;
  }, '');
};

export const isQueryValid = (source) => {
  const isValueValid = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'boolean') {
      return true;
    }

    return Boolean(value);
  };

  return source.length > 0 && source.every(item => item[COLUMN_KEYS.FIELD].current
    && item[COLUMN_KEYS.OPERATOR].current
    && isValueValid(item[COLUMN_KEYS.VALUE].current));
};

export const getTransformedValue = (val) => {
  // cover the case when user types comma-separated values instead multi-select
  if (typeof val === 'string') {
    return val.split(',').map(item => item.trim());
  }

  if (Array.isArray(val)) {
    // when using multi-select - 'item.value'
    // for initial value case = just 'item'
    return val.map((item) => item?.value || item);
  }

  return val;
};

const escapeRegex = (value) => {
  return value?.toString().replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
};

const unescapeRegex = (value) => {
  // remove leading '^' and trailing '/' from regex
  const cleanerRegex = /((^\^?)|(\/$))/g;

  // + remove escaped characters
  return value?.replace(cleanerRegex, '').replace(/\\(.)/g, '$1');
};

const getQueryOperand = (item) => {
  let queryOperand = {};

  const field = item.field.current;
  const operator = item.operator.current;
  const value = item.value.current;

  switch (operator) {
    case OPERATORS.EQUAL:
      queryOperand = { [field]: { $eq: value } };
      break;
    case OPERATORS.NOT_EQUAL:
      queryOperand = { [field]: { $ne: value } };
      break;
    case OPERATORS.GREATER_THAN:
      queryOperand = { [field]: { $gt: value } };
      break;
    case OPERATORS.GREATER_THAN_OR_EQUAL:
      queryOperand = { [field]: { $gte: value } };
      break;
    case OPERATORS.LESS_THAN:
      queryOperand = { [field]: { $lt: value } };
      break;
    case OPERATORS.LESS_THAN_OR_EQUAL:
      queryOperand = { [field]: { $lte: value } };
      break;
    case OPERATORS.IN:
      queryOperand = { [field]: { $in: getTransformedValue(value) } };
      break;
    case OPERATORS.NOT_IN:
      queryOperand = { [field]: { $nin: getTransformedValue(value) } };
      break;
    case OPERATORS.STARTS_WITH:
      queryOperand = { [field]: { $starts_with: value } };
      break;
    case OPERATORS.CONTAINS:
      queryOperand = { [field]: { $contains: value } };
      break;
    case OPERATORS.NOT_CONTAINS:
      queryOperand = { [field]: { $not_contains: value } };
      break;
    case OPERATORS.CONTAINS_ANY:
      queryOperand = { [field]: { $contains_any: getTransformedValue(value) } };
      break;
    case OPERATORS.NOT_CONTAINS_ANY:
      queryOperand = { [field]: { $not_contains_any: getTransformedValue(value) } };
      break;
    case OPERATORS.CONTAINS_ALL:
      queryOperand = { [field]: { $contains_all: getTransformedValue(value) } };
      break;
    case OPERATORS.NOT_CONTAINS_ALL:
      queryOperand = { [field]: { $not_contains_all: getTransformedValue(value) } };
      break;
    case OPERATORS.EMPTY:
      queryOperand = { [field]: { $empty: value } };
      break;
    default:
      break;
  }

  return queryOperand;
};

export const sourceToFqlQuery = (source) => {
  const query = {};
  // A temporary solution to searching for the first operand and its operator, since we only support one at the moment.
  const firstOperand = source.find(item => Boolean(item.boolean.current));
  const boolOperator = firstOperand?.boolean.current;
  const queryOperands = source.map(getQueryOperand);

  if (boolOperator) {
    query[boolOperator] = queryOperands;
  } else {
    return queryOperands[0];
  }

  return query;
};

const getSourceFields = (field) => ({
  $eq: (value) => ({ operator: OPERATORS.EQUAL, value }),
  $ne: (value) => ({ operator: OPERATORS.NOT_EQUAL, value }),
  $gt: (value) => ({ operator: OPERATORS.GREATER_THAN, value }),
  $lt: (value) => ({ operator: OPERATORS.LESS_THAN, value }),
  $gte: (value) => ({ operator: OPERATORS.GREATER_THAN_OR_EQUAL, value }),
  $lte: (value) => ({ operator: OPERATORS.LESS_THAN_OR_EQUAL, value }),
  $in: (value) => ({ operator: OPERATORS.IN, value }),
  $nin: (value) => ({ operator: OPERATORS.NOT_IN, value }),
  $starts_with: (value) => ({ operator: OPERATORS.STARTS_WITH, value }),
  $contains: (value) => ({ operator: OPERATORS.CONTAINS, value }),
  $contains_all: (value) => ({ operator: OPERATORS.CONTAINS_ALL, value }),
  $not_contains_all: (value) => ({ operator: OPERATORS.NOT_CONTAINS_ALL, value }),
  $contains_any: (value) => ({ operator: OPERATORS.CONTAINS_ANY, value }),
  $not_contains_any: (value) => ({ operator: OPERATORS.NOT_CONTAINS_ANY, value }),
  $empty: (value) => ({ operator: OPERATORS.EMPTY, value }),
  // should be removed after implementation of https://folio-org.atlassian.net/browse/MODFQMMGR-614
  $regex: (value) => {
    return value?.includes('^')
      ? { operator: OPERATORS.STARTS_WITH, value: unescapeRegex(value) }
      : { operator: OPERATORS.CONTAINS, value: unescapeRegex(value) };
  },
}[field]);

const getFormattedSourceField = async ({
  item,
  intl,
  fieldOptions,
  boolean,
  getDataOptionsWithFetching,
  preserveQueryValue, // for enum values, preserves the value (used for initial value handling in QB)
}) => {
  const [field, query] = Object.entries(item)[0];
  const fqlOperator = Object.keys(query)[0];
  const fqlValue = query[fqlOperator];

  const { operator, value } = getSourceFields(fqlOperator)(fqlValue);

  if (operator) {
    const fieldItem = fieldOptions.find(f => f.value === field);
    const defaultItem = fieldOptions[0];

    // Exceptional case, when queried field were deleted
    if (!fieldItem) {
      return {
        boolean: { options: booleanOptions, current: boolean },
        field: { options: fieldOptions, dataType: defaultItem?.dataType },
        operator: {
          current: '',
        },
        value: { current: '' },
        deleted: true,
      };
    }

    const { dataType, values, source } = fieldItem;
    const hasSourceOrValues = values || source;

    let possibleValues = values;
    let formattedValue;

    if (source) {
      possibleValues = await getDataOptionsWithFetching(field, source, '', Array.isArray(value) ? value : [value]);
    }

    if (Array.isArray(value)) {
      formattedValue = value
        .map(val => possibleValues?.find(param => param.value === val) || val);
    } else {
      let key;

      if (preserveQueryValue) {
        key = 'value';
      } else {
        key = 'label';
      }

      formattedValue = possibleValues?.find(param => param.value === value)?.[key];
    }

    return {
      boolean: { options: booleanOptions, current: boolean },
      field: { options: fieldOptions, current: field, dataType },
      operator: {
        dataType,
        options: getOperatorOptions({
          dataType,
          hasSourceOrValues,
          intl,
        }),
        current: operator,
      },
      value: { current: formattedValue || value, source, options: values },
    };
  }

  return null;
};

export const fqlQueryToSource = async ({
  initialValues,
  fieldOptions,
  intl,
  getDataOptionsWithFetching,
  preserveQueryValue,
}) => {
  if (!fieldOptions?.length || !Object.keys(initialValues).length) return [];

  const key = Object.keys(initialValues)[0];
  const sharedArgs = { intl, fieldOptions, getDataOptionsWithFetching, preserveQueryValue };

  // handle case when query contains boolean operators (AND, OR, etc.)
  if (Object.values(BOOLEAN_OPERATORS).includes(key)) {
    const formattedSource = [];

    for (const item of initialValues[key]) {
      const formattedItem = await getFormattedSourceField({
        item,
        boolean: key,
        ...sharedArgs,
      });

      if (!formattedItem?.deleted) {
        formattedSource.push(formattedItem);
      }
    }

    return formattedSource;
  }

  const singleItem = await getFormattedSourceField({
    item: initialValues,
    boolean: '',
    ...sharedArgs,
  });

  return [singleItem];
};

export const getSourceValue = ({
  initialValues,
  fieldOptions,
  intl,
  getDataOptionsWithFetching,
  preserveQueryValue = true,
}) => {
  // if initial value provided, and it has some items, fill the source with it
  const hasInitialValues = Object
    .values(initialValues ?? {})
    .some(val => (Array.isArray(val) ? val.length > 0 : Object.keys(val).length > 0));

  if (hasInitialValues) {
    return fqlQueryToSource({
      initialValues,
      fieldOptions,
      intl,
      getDataOptionsWithFetching,
      preserveQueryValue,
    });
  }

  return [sourceTemplate(fieldOptions)];
};

export const findMissingValues = (
  mainArray,
  secondaryArray,
) => {
  const mainValues = new Set(mainArray?.map((item) => item.value));

  const missingValues = [];

  for (const secondaryItem of secondaryArray) {
    const currentValue = secondaryItem.field.current;

    if (currentValue && !mainValues.has(currentValue)) {
      missingValues.push(currentValue);
    }
  }

  return missingValues;
};

// query can be passed in as source array or as a plain fqlQuery object
export const useQueryStr = (entityType, { source, fqlQuery }) => {
  const intl = useIntl();
  const { tenantTimezone: timezone } = useTenantTimezone();
  const { getDataOptions, getDataOptionsWithFetching } = useContext(RootContext);

  const [rows, setRows] = useState(null); // null is initial before we've set anything; displays loader

  const fieldOptions = useMemo(() => getFieldOptions(entityType?.columns), [entityType]);

  // there are async calls within getSourceValue, so we must use an effect :(
  useEffect(() => {
    const calculateRows = async () => {
      if (source?.length) {
        setRows(source);
      } else if (fqlQuery) {
        const upgraded = upgradeInitialValues(fqlQuery, entityType);

        setRows(
          await getSourceValue({
            initialValues: upgraded,
            fieldOptions,
            intl,
            getDataOptionsWithFetching,
            preserveQueryValue: false, // pretty print
          }),
        );
      } else {
        setRows([]);
      }
    };

    calculateRows();
  }, [source, fqlQuery, fieldOptions, intl]);

  return useMemo(() => {
    if (rows === null) {
      return <Loading />;
    } else {
      return getQueryStr(rows, fieldOptions, intl, timezone, getDataOptions);
    }
  }, [rows, fieldOptions, intl, timezone, getDataOptions]);
};
