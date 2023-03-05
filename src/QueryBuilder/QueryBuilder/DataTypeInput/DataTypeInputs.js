import React from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  TextField,
} from '@folio/stripes/components';
import {
  textInputTypes,
  numberInputTypes,
  dateInputTypes,
  booleanInputType,
  selectInputType,
} from '../../constants';

export const DataTypeInputs = ({ dataType, availableValues, ...rest }) => {
  switch (true) {
    case booleanInputType.some(type => type === dataType):
      return (
        <Select
          dataOptions={availableValues}
          {...rest}
        />
      );
    default:
      return (
        <TextField {...rest} />
      );
  }
  
};

DataTypeInputs.propTypes = {
  dataType: PropTypes.string,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf(PropTypes.bool, PropTypes.object)),
};