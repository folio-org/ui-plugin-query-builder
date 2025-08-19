import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { Loading } from '@folio/stripes/components';

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
  testId,
  emptyMessage,
  value,
  ...rest
}) => {
  const intl = useIntl();
  const { getDataOptionsWithFetching } = useContext(RootContext);
  const [searchValue, setSearchValue] = useState('');
  const isBooleanField = availableValues?.every(opt => typeof opt.value === 'boolean');
  let normalizedValue = value;

  if (isBooleanField && typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      normalizedValue = true;
    } else if (value.toLowerCase() === 'false') {
      normalizedValue = false;
    }
  }

  const getSelectOptionsWithPlaceholder = (options, isOrganizations) => {
    return isMulti ? options : [
      { value: '', label: intl.formatMessage({ id: 'ui-plugin-query-builder.control.value.placeholder' }), disabled: true },
      ...(isOrganizations ? [{ value: '', label: intl.formatMessage({ id: 'ui-plugin-query-builder.control.value.placeholder.organizations' }), disabled: true }] : []),
      ...options,
    ];
  };

  const getOptions = (staticValues, sourceValues, isOrganizations) => {
    if (staticValues) return getSelectOptionsWithPlaceholder(staticValues, isOrganizations);
    if (sourceValues) return getSelectOptionsWithPlaceholder(sourceValues, isOrganizations);

    return [];
  };

  const usedIds = (Array.isArray(value) ? value : [value]).map(item => item?.value || item).filter(Boolean);
  const optionsPromise = getDataOptionsWithFetching(fieldName, source, searchValue, usedIds);

  const filterOptions = (filterText, list) => {
    const lowerCaseFilterText = filterText?.toLowerCase() || '';

    setSearchValue(lowerCaseFilterText);

    // filtering based on list label
    const renderedItems = lowerCaseFilterText
      ? list.filter(item => item.label.toLowerCase().includes(lowerCaseFilterText))
      : list;

    // check for exact math using non-case sensitive
    const exactMatch = lowerCaseFilterText
      ? renderedItems.some(item => item.label.toLowerCase() === lowerCaseFilterText)
      : false;

    return { renderedItems, exactMatch };
  };

  const dataOptions = useMemo(() => {
    if (Array.isArray(optionsPromise)) {
      return getOptions(availableValues, optionsPromise, source?.name === ORGANIZATIONS_TYPES);
    }

    return [];
  }, [optionsPromise, availableValues, isMulti, source]);

  const handleOnChange = (selectedValue) => {
    if (onChange) onChange(selectedValue);
  };

  if (!Array.isArray(optionsPromise)) return <Loading size="large" />;

  return (
    <Component
      key={operator}
      {...rest}
      data-testid={testId}
      value={normalizedValue}
      onChange={handleOnChange}
      filter={filterOptions}
      dataOptions={dataOptions}
      emptyMessage={emptyMessage}
    />
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
};
