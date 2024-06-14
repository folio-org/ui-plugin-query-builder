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
import { ISO_FORMAT } from '../../helpers/timeUtils';

import css from '../../../QueryBuilder.css';
import { staticBooleanOptions } from '../../helpers/selectOptions';

export const DataTypeInput = ({
  availableValues,
  onChange,
  dataType,
  className,
  index,
  operator,
  getParamsSource,
  source,
  ...rest
}) => {
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  const isEqualRelatedOperator = [OPERATORS.EQUAL, OPERATORS.NOT_EQUAL].includes(operator);
  const isEmptyRelatedOperator = [OPERATORS.EMPTY].includes(operator);
  const isContainsRelatedOperator = [OPERATORS.CONTAINS, OPERATORS.NOT_CONTAINS].includes(operator);
  const hasSourceOrValues = source || availableValues;

  const textControl = ({ testId, type = 'text', textClass }) => {
    const onKeyDown = (event) => {
      // prevent typing e, +, - in number type
      if (type === 'number' && (event.keyCode === 69 || event.keyCode === 187 || event.keyCode === 189)) {
        event.preventDefault();
      }
    };

    return (
      <TextField
        data-testid={testId}
        onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
        onKeyDown={onKeyDown}
        type={type}
        className={textClass}
        {...rest}
      />
    );
  };

  const textAreaControl = () => (
    <TextArea
      data-testid="data-input-textarea"
      rows={1}
      onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
    />
  );

  const selectControl = ({ testId }) => (
    <SelectionContainer
      component={Select}
      source={source}
      testId={testId}
      getParamsSource={getParamsSource}
      availableValues={availableValues}
      onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
      {...rest}
    />
  );

  const multiSelectControl = ({ testId } = {}) => (
    <SelectionContainer
      testId={testId}
      component={MultiSelection}
      source={source}
      getParamsSource={getParamsSource}
      availableValues={availableValues}
      onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
      isMulti
      {...rest}
    />
  );

  const datePickerControl = () => (
    <Datepicker
      data-testid="data-input-dateType"
      backendDateStandard={ISO_FORMAT}
      onChange={(e, value, formattedValue) => {
        onChange(formattedValue, index, COLUMN_KEYS.VALUE);
      }}
      {...rest}
    />
  );
  const stringTypeControls = () => {
    const isInRelatedWithOptions = isInRelatedOperator && hasSourceOrValues;
    const isEqualRelatedWithOptions = isEqualRelatedOperator && hasSourceOrValues;

    if (isInRelatedWithOptions) {
      return (
        <div className={className} data-testid="data-input-select-multi-stringType">
          {multiSelectControl()}
        </div>
      );
    }

    if (isEqualRelatedWithOptions) {
      return (
        <div className={className}>
          {selectControl({ testId: 'data-input-select-single-stringType' })}
        </div>
      );
    }

    return textControl({ testId: 'data-input-text-stringType' });
  };

  const numericTypeControls = () => {
    return hasSourceOrValues
      ? selectControl({ testId: 'data-input-select-numeric' })
      : textControl({ type: 'number', textClass: css.NumberInput });
  };

  const booleanTypeControls = () => (
    <div className={className}>
      {selectControl({ testId: 'data-input-select-boolType' })}
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
        {textControl({ testId: 'data-input-text-openUUIDType' })}
      </div>
    );
  };

  const arrayLikeTypeControls = () => {
    return isInRelatedOperator
      ? multiSelectControl({ testId: 'data-input-select-multi-arrayType' })
      : selectControl({ testId: 'data-input-select-arrayType' });
  };

  if (isEmptyRelatedOperator) {
    return (
      <SelectionContainer
        component={Select}
        testId="data-input-select-booleanType"
        availableValues={staticBooleanOptions}
        onChange={(e) => onChange(JSON.parse(e.target.value), index, COLUMN_KEYS.VALUE)}
        {...rest}
      />
    );
  }

  switch (dataType) {
    case DATA_TYPES.StringType:
      return stringTypeControls();

    case DATA_TYPES.IntegerType:
    case DATA_TYPES.NumberType:
      return numericTypeControls();

    case DATA_TYPES.BooleanType:
      return booleanTypeControls();

    case DATA_TYPES.RangedUUIDType:
      return textControl({ testId: 'data-input-text-rangedUUIDType' });

    case DATA_TYPES.StringUUIDType:
      return textControl({ testId: 'data-input-text-stringUUIDType' });

    case DATA_TYPES.DateType:
      return datePickerControl();

    case DATA_TYPES.OpenUUIDType:
      return openUUIDTypeControls();

    case DATA_TYPES.ArrayType:
      return isContainsRelatedOperator && hasSourceOrValues
        ? selectControl({ testId: 'data-input-select-array' })
        : textControl({ testId: 'data-input-text-arrayType' });

    case DATA_TYPES.EnumType:
      return arrayLikeTypeControls();
    default:
      return textControl({ testId: 'data-input-text-default' });
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
