import PropTypes from 'prop-types';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { Loading } from '@folio/stripes/components';

import { useParamsDataSource } from '../../../../hooks/useParamsDataSource';
import { RootContext } from '../../../../context/RootContext';

export const SelectionContainer = ({
  operator,
  component: Component,
  availableValues,
  getParamsSource,
  isMulti,
  onChange,
  source,
  testId,
  emptyMessage,
  ...rest
}) => {
  const intl = useIntl();
  const { setDataOptions } = useContext(RootContext);
  const [searchValue, setSearchValue] = useState('');
  const getSelectOptionsWithPlaceholder = (options) => {
    return isMulti ? options : [
      { value: '', label: intl.formatMessage({ id: 'ui-plugin-query-builder.control.value.placeholder' }), disabled: true },
      ...options,
    ];
  };

  const getOptions = (staticValues, sourceValues) => {
    if (staticValues) return getSelectOptionsWithPlaceholder(staticValues);
    if (sourceValues) return getSelectOptionsWithPlaceholder(sourceValues);

    return [];
  };

  const { data, isLoading } = useParamsDataSource({ source, searchValue, getParamsSource });

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
    if (!isLoading) {
      return getOptions(availableValues, data?.content);
    }

    return [];
  }, [isLoading, data?.content, availableValues, isMulti]);

  useEffect(() => {
    setDataOptions(dataOptions);
  }, [dataOptions]);

  const handleOnChange = (value) => {
    setDataOptions(dataOptions);

    if (onChange) onChange(value);
  };

  if (isLoading) return <Loading size="large" />;

  return (
    <Component
      key={operator}
      {...rest}
      data-testid={testId}
      onChange={handleOnChange}
      filter={filterOptions}
      dataOptions={dataOptions}
      emptyMessage={emptyMessage}
    />
  );
};

SelectionContainer.propTypes = {
  operator: PropTypes.string,
  component: PropTypes.elementType,
  testId: PropTypes.string,
  isMulti: PropTypes.bool,
  onChange: PropTypes.func,
  index: PropTypes.number,
  source: PropTypes.object,
  getParamsSource: PropTypes.func,
  availableValues: PropTypes.arrayOf(PropTypes.object),
  emptyMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
};
