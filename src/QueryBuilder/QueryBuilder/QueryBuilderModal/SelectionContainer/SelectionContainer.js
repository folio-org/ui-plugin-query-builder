import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import { Loading } from '@folio/stripes/components';

import { RootContext } from '../../../../context/RootContext';
import { ORGANIZATIONS_TYPES } from '../../../../constants/dataTypes';
import { isDataOptionsLoadFailure } from '../../../../hooks/useDataOptions';
import { fuzzyOptionFormatter, fuzzySortOptions, normalizeSearchText } from '../../helpers/selectOptions';

export const SelectionContainer = ({
  fieldName,
  operator,
  component: Component,
  availableValues,
  isMulti,
  onChange,
  source,
  valueSourceApi,
  entityTypeId,
  testId,
  emptyMessage,
  fallback,
  value,
  ...rest
}) => {
  const intl = useIntl();
  const { getDataOptionsWithFetching } = useContext(RootContext);
  const [searchValue, setSearchValue] = useState('');
  const pendingSearchRef = useRef('');
  const searchUpdateRef = useRef();
  const cachedDataOptionsRef = useRef();
  const valuePlaceholder = intl.formatMessage({ id: 'ui-plugin-query-builder.control.value.placeholder' });
  const isBooleanField = availableValues?.every(opt => typeof opt.value === 'boolean');
  let normalizedValue = value;

  if (isBooleanField && typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      normalizedValue = true;
    } else if (value.toLowerCase() === 'false') {
      normalizedValue = false;
    }
  }

  const getSelectOptionsWithPlaceholder = (options, sourceName) => {
    if (ORGANIZATIONS_TYPES.includes(sourceName)) {
      return isMulti ? options : [
        { value: '', label: intl.formatMessage({ id: `ui-plugin-query-builder.control.value.placeholder.${sourceName}` }), disabled: true },
        ...options,
      ];
    }

    return options;
  };

  const getOptions = (staticValues, sourceValues, sourceName) => {
    if (staticValues) return getSelectOptionsWithPlaceholder(staticValues, sourceName);
    if (sourceValues) return getSelectOptionsWithPlaceholder(sourceValues, sourceName);

    return [];
  };

  const usedIds = (Array.isArray(value) ? value : [value]).map(item => item?.value || item).filter(Boolean);
  const optionsPromise = getDataOptionsWithFetching(
    fieldName,
    source,
    searchValue,
    usedIds,
    entityTypeId,
    valueSourceApi,
  );
  const isLoadingOptions = !Array.isArray(optionsPromise);

  useEffect(() => () => {
    if (searchUpdateRef.current) {
      clearTimeout(searchUpdateRef.current);
    }
  }, []);

  const prepareSearch = useCallback((filterText = '') => {
    const normalizedFilterText = normalizeSearchText(filterText) || '';

    pendingSearchRef.current = normalizedFilterText;

    if (searchUpdateRef.current) {
      clearTimeout(searchUpdateRef.current);
    }

    searchUpdateRef.current = setTimeout(() => {
      setSearchValue((currentSearchValue) => (
        currentSearchValue === pendingSearchRef.current ? currentSearchValue : pendingSearchRef.current
      ));
    }, 0);

    return normalizedFilterText;
  }, []);

  // For Selection (single value): onFilter must return a plain array
  const singleValueFilterOptions = useCallback((filterText, list) => {
    prepareSearch(filterText);

    return fuzzySortOptions(filterText, list);
  }, [prepareSearch]);

  // For MultiSelection (multiple values): filter must return { renderedItems, exactMatch }
  const multiValueFilterOptions = useCallback((filterText, list) => {
    const searchTerm = prepareSearch(filterText);
    const renderedItems = fuzzySortOptions(filterText, list);
    const exactMatch = list.some(item => (
      typeof item.label === 'string' &&
      normalizeSearchText(item.label).toLowerCase() === searchTerm.toLowerCase()
    ));

    return { renderedItems, exactMatch };
  }, [prepareSearch]);

  const dataOptions = useMemo(() => {
    if (Array.isArray(optionsPromise)) {
      return getOptions(availableValues, optionsPromise, source?.name);
    }

    return cachedDataOptionsRef.current ?? [];
  }, [optionsPromise, availableValues, isMulti, source]);

  useEffect(() => {
    if (Array.isArray(optionsPromise)) {
      cachedDataOptionsRef.current = dataOptions;
    }
  }, [dataOptions, optionsPromise]);

  const handleOnChange = (selectedValue) => {
    if (isBooleanField && typeof selectedValue === 'boolean') {
      selectedValue = String(selectedValue);
    }
    if (onChange) onChange(selectedValue);
  };

  if (isDataOptionsLoadFailure(optionsPromise)) return fallback ?? null;

  if (isLoadingOptions && !cachedDataOptionsRef.current) return <Loading size="large" />;

  const filterProps = isMulti
    ? { filter: multiValueFilterOptions }
    : { onFilter: singleValueFilterOptions };
  const shouldShowOptionsLoading = isLoadingOptions && searchValue !== '';
  const loadingProps = isMulti
    ? { showLoading: shouldShowOptionsLoading }
    : { loading: shouldShowOptionsLoading };

  return (
    <div data-testid={testId}>
      <Component
        key={operator}
        {...rest}
        {...filterProps}
        {...loadingProps}
        value={normalizedValue}
        onChange={handleOnChange}
        formatter={fuzzyOptionFormatter}
        placeholder={isMulti ? undefined : valuePlaceholder}
        dataOptions={dataOptions}
        emptyMessage={emptyMessage}
      />
    </div>
  );
};

SelectionContainer.propTypes = {
  fieldName: PropTypes.string,
  operator: PropTypes.string,
  component: PropTypes.elementType,
  testId: PropTypes.string,
  isMulti: PropTypes.bool,
  onChange: PropTypes.func,
  index: PropTypes.number,
  source: PropTypes.shape({}),
  valueSourceApi: PropTypes.shape({}),
  availableValues: PropTypes.arrayOf(PropTypes.shape({})),
  fallback: PropTypes.node,
  emptyMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.array,
    PropTypes.shape({}),
  ]),
  entityTypeId: PropTypes.string,
};
