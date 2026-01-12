import React, { memo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { Dropdown, DropdownMenu, TextField } from '@folio/stripes/components';
import { CheckboxFilter } from '@folio/stripes/smart-components';

import css from '../../../ResultViewer/ResultViewer.css';

export const ColumnsDropdown = memo(({ columns, visibleColumns, onColumnChange }) => {
  const intl = useIntl();
  const [columnSearch, setColumnSearch] = useState('');

  const filteredColumns = columns.filter(item => item.label.toLowerCase().includes(columnSearch.toLowerCase()));
  const allDisabled = columns.every(item => item.disabled);

  if (!columns.length) return null;

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
        <div className={css.DropdownStickyHeader}>
          <TextField
            value={columnSearch}
            onChange={e => setColumnSearch(e.target.value)}
            aria-label={intl.formatMessage({ id: 'ui-plugin-query-builder.ariaLabel.columnFilter' })}
            disabled={allDisabled}
            placeholder={intl.formatMessage({ id: 'ui-plugin-query-builder.control.search.placeholder' })}
          />
        </div>
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
