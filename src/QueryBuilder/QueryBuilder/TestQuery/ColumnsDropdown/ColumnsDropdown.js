import React, { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Dropdown, DropdownMenu } from '@folio/stripes/components';
import { CheckboxFilter } from '@folio/stripes/smart-components';
import PropTypes from 'prop-types';

export const ColumnsDropdown = memo(({ columns, visibleColumns, onColumnChange }) => {
  return (
    <Dropdown
      label={<FormattedMessage id="ui-plugin-query-builder.control.dropdown.showColumns" />}
      mame="test-query-preview-dropdown"
    >
      <DropdownMenu
        role="menu"
        overrideStyle={{ maxHeight: 400 }}
      >
        <CheckboxFilter
          dataOptions={columns}
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
