import React from 'react';
import PropTypes from 'prop-types';
import { Select,
  TextField,
  MultiSelection,
  Datepicker } from '@folio/stripes/components';

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
    case DATA_TYPES.EnumType:
      return (
        (operator === OPERATORS.IN || operator === OPERATORS.NOT_IN) ?
          (
            <div className={className}>
              <MultiSelection
                dataOptions={availableValues}
                onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
                {...rest}
              />
            </div>
          )
          :
          (
            <div className={className}>
              <Select
                dataOptions={availableValues}
                onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
                {...rest}
              />
            </div>
          ));
    case DATA_TYPES.DateType:
      return (
        <Datepicker
          onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
          {...rest}
        />
      );
    default:
      return (
        <TextField
          onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
          usePortal
          {...rest}
        />
      );
  }
};

DataTypeInput.propTypes = {
  dataType: PropTypes.string,
  className: PropTypes.string,
  operator: PropTypes.string,
  onChange: PropTypes.func,
  index: PropTypes.number,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf(PropTypes.bool, PropTypes.object)),
};
