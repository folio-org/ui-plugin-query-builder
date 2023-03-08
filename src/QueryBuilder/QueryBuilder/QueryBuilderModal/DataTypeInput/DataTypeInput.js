import React from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  TextField,
} from '@folio/stripes/components';

import { DATA_TYPES } from '../../constants/dataTypes';

export const DataTypeInput = ({ dataType, availableValues, className, ...rest }) => {
  switch (true) {
    case DATA_TYPES.BooleanType === dataType:
      return (
        <div className={className}>
          <Select
            dataOptions={availableValues}
            {...rest}
          />
        </div>
      );
    default:
      return (
        <TextField {...rest} />
      );
  }
};

DataTypeInput.propTypes = {
  dataType: PropTypes.string,
  className: PropTypes.string,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf(PropTypes.bool, PropTypes.object)),
};
