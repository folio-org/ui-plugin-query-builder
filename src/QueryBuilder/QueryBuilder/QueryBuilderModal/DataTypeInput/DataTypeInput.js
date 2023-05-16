import React from 'react';
import PropTypes from 'prop-types';
import { Select,
  TextField,
  MultiSelection,
  TextArea,
  Datepicker } from '@folio/stripes/components';

import { FormattedMessage } from 'react-intl';
import { DATA_TYPES } from '../../../../constants/dataTypes';
import { COLUMN_KEYS } from '../../../../constants/columnKeys';
import { OPERATORS } from '../../../../constants/operators';
import { SelectionContainer } from '../SelectionContainer/SelectionContainer';

export const DataTypeInput = ({
  onChange,
  dataType,
  availableValues,
  className,
  index,
  operator,
  getParamsSource,
  source,
  ...rest
}) => {
  switch (dataType) {
    case DATA_TYPES.BooleanType:
      return (
        <div className={className}>
          <SelectionContainer
            Selection={Select}
            nameOfComponent="Select"
            getParamsSource={getParamsSource}
            data-testid="data-input-select-bool"
            availableValues={availableValues}
            onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
            {...rest}
          />
        </div>
      );
    case DATA_TYPES.RangedUUIDType:
      return (
        <div className={className}>
          <SelectionContainer
            source={source}
            nameOfComponent="MultiSelection"
            Selection={MultiSelection}
            getParamsSource={getParamsSource}
            availableValues={availableValues}
            onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
            {...rest}
          />
        </div>
      );
    case DATA_TYPES.OpenUUIDType:
      return (
        operator === OPERATORS.IN || operator === OPERATORS.NOT_IN ? (
          <>
            <TextArea
              data-testid="data-input-textarea"
              rows={1}
              onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
            />
            <FormattedMessage id="ui-plugin-query-builder.control.info.separateValues" />
          </>
        ) : (
          <div className={className}>
            <TextField
              data-testid="data-input-textField"
              onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
              {...rest}
            />
          </div>
        )
      );
    case DATA_TYPES.ArrayType:
    case DATA_TYPES.EnumType:
      return (
        (operator === OPERATORS.IN || operator === OPERATORS.NOT_IN)
          ? (
            <div className={className}>
              <SelectionContainer
                source={source}
                Selection={MultiSelection}
                availableValues={availableValues}
                nameOfComponent="MultiSelection"
                getParamsSource={getParamsSource}
                data-testid={`data-input-multiselect-${dataType}`}
                onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
                {...rest}
              />
            </div>
          )
          : (
            <div className={className}>
              <SelectionContainer
                Selection={Select}
                nameOfComponent="Select"
                data-testid="data-input-select-array"
                source={source}
                getParamsSource={getParamsSource}
                availableValues={availableValues}
                onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
                {...rest}
              />
            </div>
          ));
    case DATA_TYPES.DateType:
      return (
        <Datepicker
          data-testid="data-input-datepicker"
          onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
          {...rest}
        />
      );
    default:
      return (
        <TextField
          data-testid="data-input-default-textField"
          onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
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
  source: PropTypes.object,
  getParamsSource: PropTypes.func,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.bool, PropTypes.object])),
};
