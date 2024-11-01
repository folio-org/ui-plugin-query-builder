import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useParamsDataSource } from '../../../../hooks/useParamsDataSource';

export const SelectionContainer = ({
  operator,
  component: Component,
  availableValues,
  getParamsSource,
  isMulti,
  onChange,
  source,
  testId,
  ...rest
}) => {
  const intl = useIntl();
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

  const { data } = useParamsDataSource({ source, searchValue, getParamsSource });

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

  const dataOptions = getOptions(availableValues, data?.content);

  return (
    <Component
      key={operator}
      {...rest}
      data-testid={testId}
      onChange={onChange}
      filter={filterOptions}
      dataOptions={dataOptions}
    />);
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
};
