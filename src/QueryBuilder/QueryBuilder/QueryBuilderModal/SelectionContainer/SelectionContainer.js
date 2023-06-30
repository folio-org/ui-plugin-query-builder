import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useParamsDataSource } from '../../../../hooks/useParamsDataSource';

export const SelectionContainer = ({
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
    // escape special characters in filter text, so they won't be interpreted by RegExp
    const escapedFilterText = filterText?.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');

    setSearchValue(filterText);

    const filterRegExp = new RegExp(`${escapedFilterText}`, 'i');
    const renderedItems = filterText ? list?.filter(item => item.label.search(filterRegExp) !== -1)
      :
      list;
    const exactMatch = filterText ? (renderedItems.filter(item => item.label === filterText).length === 1) : false;

    return { renderedItems, exactMatch };
  };

  const dataOptions = getOptions(availableValues, data?.content);

  return (
    <Component
      {...rest}
      data-testid={testId}
      onChange={onChange}
      filter={filterOptions}
      dataOptions={dataOptions}
    />);
};

SelectionContainer.propTypes = {
  component: PropTypes.elementType,
  testId: PropTypes.string,
  isMulti: PropTypes.bool,
  onChange: PropTypes.func,
  index: PropTypes.number,
  source: PropTypes.object,
  getParamsSource: PropTypes.func,
  availableValues: PropTypes.arrayOf(PropTypes.object),
};
