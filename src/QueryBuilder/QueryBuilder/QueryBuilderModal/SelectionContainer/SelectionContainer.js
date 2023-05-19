import PropTypes from 'prop-types';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useParamsDataSource } from '../../../../hooks/useParamsDataSource';

export const SelectionContainer = (
  {
    component: Component,
    availableValues,
    nameOfComponent,
    onChange,
    getParamsSource,
    source,
    ...rest
  },
) => {
  const intl = useIntl();
  const [searchValue, setSearchValue] = useState('');
  const getSelectOptionsWithPlaceholder = (options) => {
    if (nameOfComponent === 'Select' && Array.isArray(options)) {
      return [
        { value: '', label: intl.formatMessage({ id: 'ui-plugin-query-builder.control.value.placeholder' }), disabled: true },
        ...options,
      ];
    } else return options;
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

  const dataOptions = getSelectOptionsWithPlaceholder(availableValues)
    || getSelectOptionsWithPlaceholder(data?.content)
    || [];

  return (
    <Component
      {...rest}
      onChange={onChange}
      filter={filterOptions}
      dataOptions={dataOptions}
    />);
};

SelectionContainer.propTypes = {
  component: PropTypes.node,
  nameOfComponent: PropTypes.string,
  onChange: PropTypes.func,
  index: PropTypes.number,
  source: PropTypes.object,
  getParamsSource: PropTypes.func,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.bool, PropTypes.object])),
};
