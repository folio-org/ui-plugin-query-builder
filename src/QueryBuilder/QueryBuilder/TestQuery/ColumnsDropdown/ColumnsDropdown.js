import React, { memo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Dropdown, DropdownMenu, TextField } from '@folio/stripes/components';
import { CheckboxFilter } from '@folio/stripes/smart-components';
import PropTypes from 'prop-types';

export const ColumnsDropdown = memo(({ columns, visibleColumns, onColumnChange }) => {
  const intl = useIntl();
  const [columnSearch, setColumnSearch] = useState('');

  const filteredColumns = columns.filter(item => item.label.toLowerCase().includes(columnSearch.toLowerCase()));
  const allDisabled = columns.every(item => item.disabled);

  return (
    <Dropdown
      label={<FormattedMessage id="ui-plugin-query-builder.control.dropdown.showColumns" />}
      mame="test-query-preview-dropdown"
      usePortal
    >
      <DropdownMenu
        role="menu"
        overrideStyle={{ maxHeight: 240 }}
      >
        <TextField
          value={columnSearch}
          onChange={e => setColumnSearch(e.target.value)}
          aria-label={intl.formatMessage({ id: 'ui-plugin-query-builder.ariaLabel.columnFilter' })}
          disabled={allDisabled}
          placeholder={intl.formatMessage({ id: 'ui-plugin-query-builder.control.search.placeholder' })}
        />
        <CheckboxFilter
          dataOptions={filteredColumns}
          selectedValues={visibleColumns}
          onChange={onColumnChange}
          name="name"
        />
      </DropdownMenu>
    </Dropdown>
  );
});

ColumnsDropdown.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object),
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  onColumnChange: PropTypes.func,
};
