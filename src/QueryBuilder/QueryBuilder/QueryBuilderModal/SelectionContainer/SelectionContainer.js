import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import fuzzysort from 'fuzzysort';

import { Loading, OptionSegment } from '@folio/stripes/components';

import { RootContext } from '../../../../context/RootContext';
import { ORGANIZATIONS_TYPES } from '../../../../constants/dataTypes';

export const SelectionContainer = ({
  fieldName,
  operator,
  component: Component,
  availableValues,
  isMulti,
  onChange,
  source,
  entityTypeId,
  testId,
  emptyMessage,
  value,
  ...rest
}) => {
  const intl = useIntl();
  const { getDataOptionsWithFetching } = useContext(RootContext);
  const [searchValue, setSearchValue] = useState('');
  const pendingSearchRef = useRef('');
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
  const optionsPromise = getDataOptionsWithFetching(fieldName, source, searchValue, usedIds, entityTypeId);

  useEffect(() => {
    if (pendingSearchRef.current !== searchValue) {
      setSearchValue(pendingSearchRef.current);
    }
  }, [searchValue]);

  const fuzzySort = useCallback((searchTerm, list) => {
    if (!searchTerm) return list;

    const results = [...fuzzysort.go(searchTerm, list, { key: 'label' })];

    // Score descending, then label ascending for ties
    results.sort((a, b) => {
      if (a.score === b.score) return a.target.localeCompare(b.target);

      return -(a.score - b.score);
    });

    return results.map(result => result.obj);
  }, []);

  const prepareSearch = useCallback((filterText = '') => {
    pendingSearchRef.current = filterText;

    return filterText;
  }, []);

  // For Selection (single value): onFilter must return a plain array
  const singleValueFilterOptions = useCallback(
    (filterText, list) => fuzzySort(prepareSearch(filterText), list), [fuzzySort, prepareSearch],
  );

  // For MultiSelection (multiple values): filter must return { renderedItems, exactMatch }
  const multiValueFilterOptions = useCallback((filterText, list) => {
    const searchTerm = prepareSearch(filterText);
    const renderedItems = fuzzySort(searchTerm, list);
    const exactMatch = list.some(item => item.label?.toLowerCase() === searchTerm.toLowerCase());

    return { renderedItems, exactMatch };
  }, [fuzzySort, prepareSearch]);

  const fuzzyFormatter = useCallback(({ option, searchTerm }) => {
    if (!option?.label) {
      return <OptionSegment />;
    }

    if (typeof searchTerm !== 'string' || searchTerm === '') {
      return <OptionSegment>{option.label}</OptionSegment>;
    }

    const result = fuzzysort.single(searchTerm, option.label);

    if (!result) {
      return <OptionSegment>{option.label}</OptionSegment>;
    }

    return (
      <OptionSegment>
        {fuzzysort.highlight(result, (match, i) => (
          <span key={i} className="mark---opJNO">
            {match}
          </span>
        ))}
      </OptionSegment>
    );
  }, []);

  const dataOptions = useMemo(() => {
    if (Array.isArray(optionsPromise)) {
      return getOptions(availableValues, optionsPromise, source?.name);
    }

    return [];
  }, [optionsPromise, availableValues, isMulti, source]);

  const handleOnChange = (selectedValue) => {
    if (isBooleanField && typeof selectedValue === 'boolean') {
      selectedValue = String(selectedValue);
    }
    if (onChange) onChange(selectedValue);
  };

  if (!Array.isArray(optionsPromise)) return <Loading size="large" />;

  const filterProps = isMulti
    ? { filter: multiValueFilterOptions }
    : { onFilter: singleValueFilterOptions };

  return (
    <div data-testid={testId}>
      <Component
        key={operator}
        {...rest}
        {...filterProps}
        value={normalizedValue}
        onChange={handleOnChange}
        formatter={fuzzyFormatter}
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
  source: PropTypes.object,
  availableValues: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.array,
    PropTypes.object,
  ]),
  entityTypeId: PropTypes.string,
};