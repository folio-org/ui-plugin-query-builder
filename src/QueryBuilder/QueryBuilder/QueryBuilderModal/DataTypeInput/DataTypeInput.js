import React from 'react';
import PropTypes from 'prop-types';
import { Pluggable } from '@folio/stripes/core';
import { Select,
  TextField,
  MultiSelection,
  TextArea,
  Datepicker } from '@folio/stripes/components';

import { FormattedMessage } from 'react-intl';
import {
  DATA_TYPES,
  ORGANIZATIONS_TYPES,
} from '../../../../constants/dataTypes';
import { COLUMN_KEYS } from '../../../../constants/columnKeys';
import { OPERATORS } from '../../../../constants/operators';
import useTenantTimezone from '../../../../hooks/useTenantTimezone';
import { SelectionContainer } from '../SelectionContainer/SelectionContainer';

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
  fieldName,
  value,
  ...rest
}) => {
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  const isEqualRelatedOperator = [OPERATORS.EQUAL, OPERATORS.NOT_EQUAL].includes(operator);
  const isEmptyRelatedOperator = [OPERATORS.EMPTY].includes(operator);
  const isContainsOperator = [OPERATORS.CONTAINS].includes(operator);
  const isContainsRelatedOperator = [
    OPERATORS.NOT_CONTAINS_ANY,
    OPERATORS.CONTAINS_ANY,
    OPERATORS.CONTAINS_ALL,
    OPERATORS.NOT_CONTAINS_ALL,
  ].includes(operator);
  const hasSourceOrValues = source || availableValues;

  const { tenantTimezone: timezone } = useTenantTimezone();

  const textControl = ({ testId, type = 'text', value: inputValue, textClass }) => {
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
        value={inputValue}
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

  const selectControl = ({ testId, value: inputValue }) => (
    <SelectionContainer
      fieldName={fieldName}
      component={Select}
      source={source}
      testId={testId}
      getParamsSource={getParamsSource}
      availableValues={availableValues}
      value={inputValue}
      onChange={(e) => onChange(e.target.value, index, COLUMN_KEYS.VALUE)}
      {...rest}
    />
  );

  const multiSelectControl = ({ testId, value: inputValue, emptyMessage = '' } = {}) => (
    <SelectionContainer
      fieldName={fieldName}
      operator={operator}
      testId={testId}
      component={MultiSelection}
      source={source}
      getParamsSource={getParamsSource}
      availableValues={availableValues}
      onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
      isMulti
      emptyMessage={emptyMessage}
      value={inputValue}
      {...rest}
    />
  );

  const datePickerControl = () => {
    const selectedValue = value;
    const formattedSelectedDate = selectedValue ? `${selectedValue}Z` : selectedValue;

    return (
      <Datepicker
        timeZone={timezone}
        data-testid="data-input-dateType"
        onChange={(e, _unusedValue, formattedValue) => {
          onChange(formattedValue.replace('Z', ''), index, COLUMN_KEYS.VALUE);
        }}
        {...rest}
        value={formattedSelectedDate}
      />
    );
  };

  const stringTypeControls = () => {
    const isPluginOrganizationRequired = source?.name === ORGANIZATIONS_TYPES;
    const isInRelatedWithOptions = isInRelatedOperator && hasSourceOrValues;
    const isEqualRelatedWithOptions = isEqualRelatedOperator && hasSourceOrValues;

    if (isInRelatedWithOptions && isPluginOrganizationRequired) {
      return (
        <div className={className} data-testid="data-input-select-multi-stringType">
          {multiSelectControl({
            testId: 'data-input-select-multi-stringType',
            value,
            emptyMessage: <FormattedMessage id="ui-plugin-query-builder.noOptionsAvailable" />,
          })}
          <Pluggable
            id="organization-plugin"
            aria-haspopup="true"
            dataKey="organization"
            searchButtonStyle="link"
            searchLabel={<FormattedMessage id="stripes-acq-components.filter.organization.lookup" />}
            selectVendor={(selectedItems) => {
              const normalizedItems = selectedItems.map(item => ({
                value: item.id,
                label: item.name,
              }));

              onChange(normalizedItems, index, COLUMN_KEYS.VALUE);
            }}
            type="find-organization"
            usePortal
            isMultiSelect
          >
            <FormattedMessage id="stripes-acq-components.filter.organization.lookupNoSupport" />
          </Pluggable>
        </div>
      );
    }

    if (isInRelatedWithOptions) {
      return (
        <div className={className} data-testid="data-input-select-multi-stringType">
          {multiSelectControl({ value })}
        </div>
      );
    }

    if (isEqualRelatedWithOptions && isPluginOrganizationRequired) {
      return (
        <div className={className}>
          {selectControl({ testId: 'data-input-select-single-stringType', value })}
          <Pluggable
            id="organization-plugin"
            aria-haspopup="true"
            dataKey="organization"
            searchButtonStyle="link"
            searchLabel={<FormattedMessage id="stripes-acq-components.filter.organization.lookup" />}
            selectVendor={(e) => onChange(e.id, index, COLUMN_KEYS.VALUE)}
            type="find-organization"
            usePortal
          >
            <FormattedMessage id="stripes-acq-components.filter.organization.lookupNoSupport" />
          </Pluggable>
        </div>
      );
    }

    if (isEqualRelatedWithOptions) {
      return (
        <div className={className}>
          {selectControl({ testId: 'data-input-select-single-stringType', value })}
        </div>
      );
    }

    return textControl({ testId: 'data-input-text-stringType', value });
  };

  const numericTypeControls = () => {
    return hasSourceOrValues
      ? selectControl({ testId: 'data-input-select-numeric', value })
      : textControl({ type: 'number', value, textClass: css.NumberInput });
  };

  const booleanTypeControls = () => {
    availableValues = (availableValues ?? []).map(opt => ({
      ...opt,
      value: opt.value === 'true' || opt.value === true,
    }));

    return (
      <div className={className}>
        {selectControl({ testId: 'data-input-select-boolType', value })}
      </div>
    );
  };

  const openUUIDTypeControls = () => {
    return isInRelatedOperator ? (
      <>
        {textAreaControl()}
        <FormattedMessage id="ui-plugin-query-builder.control.info.separateValues" />
      </>
    ) : (
      <div className={className}>
        {textControl({ testId: 'data-input-text-openUUIDType', value })}
      </div>
    );
  };

  //
  const arrayLikeTypeControls = () => {
    return isInRelatedOperator
      ? multiSelectControl({ testId: 'data-input-select-multi-arrayType', value })
      : selectControl({ testId: 'data-input-select-arrayType', value });
  };

  if (isEmptyRelatedOperator) {
    return (
      <SelectionContainer
        fieldName={fieldName}
        component={Select}
        testId="data-input-select-booleanType"
        availableValues={staticBooleanOptions}
        onChange={(e) => onChange(JSON.parse(e.target.value), index, COLUMN_KEYS.VALUE)}
        value={value}
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
      return textControl({ testId: 'data-input-text-rangedUUIDType', value });

    case DATA_TYPES.StringUUIDType:
      return textControl({ testId: 'data-input-text-stringUUIDType', value });

    case DATA_TYPES.DateType:
      return datePickerControl();

    case DATA_TYPES.OpenUUIDType:
      return openUUIDTypeControls();

    case DATA_TYPES.ArrayType:
      if (isEqualRelatedOperator && hasSourceOrValues) {
        return selectControl({ testId: 'data-input-select-single-arrayType', value });
      }
      if (isContainsOperator && hasSourceOrValues) {
        return selectControl({ testId: 'data-input-select-single-arrayType', value });
      }
      if (isInRelatedOperator && hasSourceOrValues) {
        return multiSelectControl({ testId: 'data-input-select-multi-arrayType', value });
      }
      return isContainsRelatedOperator && hasSourceOrValues
        ? multiSelectControl({ testId: 'data-input-select-multi-arrayType', value })
        : textControl({ testId: 'data-input-text-arrayType', value });

    case DATA_TYPES.JsonbArrayType:
      if (isEqualRelatedOperator && hasSourceOrValues) {
        return selectControl({ testId: 'data-input-select-single-jsonbArrayType', value });
      }
      if (isContainsOperator && hasSourceOrValues) {
        return selectControl({ testId: 'data-input-select-single-jsonbArrayType', value });
      }
      if (isInRelatedOperator && hasSourceOrValues) {
        return multiSelectControl({ testId: 'data-input-select-multi-jsonbArrayType', value });
      }
      return isContainsRelatedOperator && hasSourceOrValues
        ? multiSelectControl({ testId: 'data-input-select-multi-jsonbArrayType', value })
        : textControl({ testId: 'data-input-text-jsonbArrayType', value });

    case DATA_TYPES.EnumType:
      return arrayLikeTypeControls();
    default:
      return textControl({ testId: 'data-input-text-default', value });
  }
};

DataTypeInput.propTypes = {
  dataType: PropTypes.string,
  fieldName: PropTypes.string,
  className: PropTypes.string,
  operator: PropTypes.string,
  onChange: PropTypes.func,
  index: PropTypes.number,
  source: PropTypes.object,
  getParamsSource: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.array,
    PropTypes.object,
  ]),
  availableValues: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
      PropTypes.object,
    ]),
  ),
};