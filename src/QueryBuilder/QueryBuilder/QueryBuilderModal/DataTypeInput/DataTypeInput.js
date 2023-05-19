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
  values,
  ...rest
}) => {
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  const isEqualRelatedOperator = [OPERATORS.EQUAL, OPERATORS.NOT_EQUAL].includes(operator);
  const hasSourceOrValues = source || values;

  const textControl = () => (
    <TextField
      data-testid="data-input-default-textField"
      onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
      {...rest}
    />
  );

  const textAreaControl = () => (
    <TextArea
      data-testid="data-input-textarea"
      rows={1}
      onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
    />
  );

  const selectControl = ({ testId }) => (
    <SelectionContainer
      nameOfComponent="Select"
      component={Select}
      source={source}
      values={values}
      data-testid={testId}
      getParamsSource={getParamsSource}
      availableValues={availableValues}
      onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
      {...rest}
    />
  );

  const datePickerControl = () => (
    <Datepicker
      data-testid="data-input-datepicker"
      onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
      {...rest}
    />
  );

  const multiSelectControl = () => (
    <SelectionContainer
      nameOfComponent="MultiSelection"
      component={MultiSelection}
      source={source}
      values={values}
      getParamsSource={getParamsSource}
      availableValues={availableValues}
      onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
      {...rest}
    />
  );
  const stringTypeControls = () => {
    const isInRelatedWithOptions = isInRelatedOperator && hasSourceOrValues;
    const isEqualRelatedWithOptions = isEqualRelatedOperator && hasSourceOrValues;

    if (isInRelatedWithOptions) {
      return (
        <div className={className}>
          {multiSelectControl()}
        </div>
      );
    }

    if (isEqualRelatedWithOptions) {
      return (
        <div className={className}>
          {selectControl({ testId: 'data-input-select-generic' })}
        </div>
      );
    }

    return textControl();
  };

  const numericTypeControls = () => {
    return hasSourceOrValues ? selectControl({ testId: 'data-input-select-numeric' }) : textControl();
  };

  const booleanTypeControls = () => (
    <div className={className}>
      {selectControl({ testId: 'data-input-select-bool' })}
    </div>
  );

  const openUUIDTypeControls = () => {
    return isInRelatedOperator ? (
      <>
        {textAreaControl()}
        <FormattedMessage id="ui-plugin-query-builder.control.info.separateValues" />
      </>
    ) : (
      <div className={className}>
        {textControl()}
      </div>
    );
  };

  const arrayLikeTypeControls = () => {
    return isInRelatedOperator ? multiSelectControl() : selectControl({ testId: 'data-input-select-array' });
  };

  switch (dataType) {
    case DATA_TYPES.StringType:
      return stringTypeControls();

    case DATA_TYPES.IntegerType:
    case DATA_TYPES.NumberType:
      return numericTypeControls();

    case DATA_TYPES.BooleanType:
      return booleanTypeControls();

    case DATA_TYPES.RangedUUIDType:
      return textControl();

    case DATA_TYPES.DateType:
      return datePickerControl();

    case DATA_TYPES.OpenUUIDType:
      return openUUIDTypeControls();

    case DATA_TYPES.ArrayType:
    case DATA_TYPES.EnumType:
      return arrayLikeTypeControls();
    default:
      return textControl();
  }
};

DataTypeInput.propTypes = {
  dataType: PropTypes.string,
  className: PropTypes.string,
  operator: PropTypes.string,
  onChange: PropTypes.func,
  index: PropTypes.number,
  source: PropTypes.object,
  values: PropTypes.arrayOf(PropTypes.object),
  getParamsSource: PropTypes.func,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.bool, PropTypes.object])),
};
