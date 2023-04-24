import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

// eslint-disable-next-line consistent-return
export const SelectionContainer = ({ Selection,
  availableValues,
  onChange,
  getParamsSource,
  source = {},
  ...rest }) => {
  const intl = useIntl();
  const [searchValue, setSearchValue] = useState('');
  const getSelectOptionsWithPlaceholder = (options) => [
    { value: '', label: intl.formatMessage({ id: 'ui-plugin-query-builder.control.value.placeholder' }), disabled: true },
    ...options,
  ];

  const { data } = useQuery({
    queryKey: [source?.source.entityTypeId],
    queryFn: () => getParamsSource(
      { entityTypeId: source?.source.entityTypeId,
        source: source?.source.columnName,
        search: searchValue },
    ),
  });

  const filterOptions = useCallback((filterText, list) => {
    // escape special characters in filter text, so they won't be interpreted by RegExp
    const escapedFilterText = filterText?.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');

    setSearchValue(filterText);

    const filterRegExp = new RegExp(`${escapedFilterText}`, 'i');
    const renderedItems = filterText ? list?.filter(item => item.label.search(filterRegExp) !== -1)
      :
      list;
    const exactMatch = filterText ? (renderedItems.filter(item => item.label === filterText).length === 1) : false;

    return { renderedItems, exactMatch };
  }, [searchValue]);

  if (!data) {
    return null;
  }

  if (data?.values) {
    return (
      <Selection
        {...rest}
        onChange={onChange}
        filter={filterOptions}
        dataOptions={data.values}
      />);
  }
};

SelectionContainer.propTypes = {
  Selection: PropTypes.node,
  onChange: PropTypes.func,
  index: PropTypes.number,
  source: PropTypes.object,
  getParamsSource: PropTypes.func,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.bool, PropTypes.object])),
};