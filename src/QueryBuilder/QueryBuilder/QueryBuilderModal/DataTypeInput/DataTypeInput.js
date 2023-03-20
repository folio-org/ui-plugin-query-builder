import React from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  TextField,
  MultiSelection,
  TextArea,
} from '@folio/stripes/components';

import { DATA_TYPES } from '../../constants/dataTypes';
import { COLUMN_KEYS } from '../../constants/columnKeys';
import { OPERATORS } from '../../constants/operators';

export const DataTypeInput = ({ onChange, dataType, availableValues, className, index, operator, ...rest }) => {
  switch (dataType) {
    case DATA_TYPES.BooleanType:
      return (
        <div className={className}>
          <Select
            dataOptions={availableValues}
            onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
            {...rest}
          />
        </div>
      );
    case DATA_TYPES.RangedUUIDType:
      return (
        <div className={className}>
          <MultiSelection
            dataOptions={availableValues}
            onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
            {...rest}
          />
        </div>
      );
    case DATA_TYPES.OpenUUIDType:
      return (
        operator === OPERATORS.IN || operator === OPERATORS.NOT_IN ? (
          <TextArea
            rows={1}
            onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
          />
        ) : (
          <div className={className}>
            <TextField
              onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
              {...rest}
            />
          </div>
        )
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
