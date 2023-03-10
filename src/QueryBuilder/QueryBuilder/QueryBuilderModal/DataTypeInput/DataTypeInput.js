import React from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  TextField,
  MultiSelection,
} from '@folio/stripes/components';

import { DATA_TYPES } from '../../constants/dataTypes';
import { COLUMN_KEYS } from '../../constants/columnKeys';

export const DataTypeInput = ({ onChange, dataType, availableValues, className, index, ...rest }) => {
  switch (true) {
    case DATA_TYPES.BooleanType === dataType:
      return (
        <div className={className}>
          <Select
            dataOptions={availableValues}
            onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
            {...rest}
          />
        </div>
      );
    case DATA_TYPES.RangedUUIDType === dataType:
      return (
        <div className={className}>
          <MultiSelection
            dataOptions={availableValues}
            onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
            {...rest}
          />
        </div>
      );
    default:
      return (
        <TextField
          onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
          {...rest}
        />
      );
  }
};

DataTypeInput.propTypes = {
  dataType: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  index: PropTypes.number,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf(PropTypes.bool, PropTypes.object)),
};
