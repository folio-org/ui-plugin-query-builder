import {
  Datepicker,
  MultiSelection,
  Select,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import { COLUMN_KEYS } from '../../../../constants/columnKeys';
import {
  DATA_TYPES,
  ORGANIZATIONS_TYPE_DONOR,
  ORGANIZATIONS_TYPES,
} from '../../../../constants/dataTypes';
import { OPERATORS } from '../../../../constants/operators';
import useTenantTimezone from '../../../../hooks/useTenantTimezone';
import { staticBooleanOptions } from '../../helpers/selectOptions';
import { SelectionContainer } from '../SelectionContainer/SelectionContainer';

import css from '../../../QueryBuilder.css';

function getOrganizationPluginButton(source, multi, onChange, value, index) {
  if (!ORGANIZATIONS_TYPES.includes(source?.name)) {
    return { organizationPluginButton: null, multiSelectionEmptyMessage: undefined };
  }

  let extraProps = {};

  if (multi) {
    extraProps = {
      ...extraProps,
      selectVendor: (selectedItems) => {
        const normalizedItems = selectedItems.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        onChange(
          [...(Array.isArray(value) ? value : []), ...normalizedItems],
          index,
          COLUMN_KEYS.VALUE,
        );
      },
      isMultiSelect: true,
    };
  }

  if (source.name === ORGANIZATIONS_TYPE_DONOR) {
    extraProps = {
      ...extraProps,
      initialFilters: { isDonor: 'true' },
      hiddenFilters: ['isDonor'],
    };
  }

  return {
    organizationPluginButton: (
      <Pluggable
        id="organization-plugin"
        type="find-organization"
        usePortal
        aria-haspopup="true"
        dataKey="organization"
        searchButtonStyle="link"
        searchLabel={<FormattedMessage id={`ui-plugin-query-builder.control.search.button.${source.name}`} />}
        selectVendor={(e) => onChange(e.id, index, COLUMN_KEYS.VALUE)}
        {...extraProps}
      >
        <FormattedMessage id={`ui-plugin-query-builder.control.search.button.${source.name}`} />
      </Pluggable>
    ),
    multiSelectionEmptyMessage: (
      <FormattedMessage id={`ui-plugin-query-builder.noOptionsAvailable.${source.name}`} />
    ),
  };
}

export const DataTypeInput = ({
  availableValues,
  onChange,
  dataType,
  className,
  index,
  operator,
  source,
  fieldName,
  value,
  entityTypeId,
  ...rest
}) => {
  const isInRelatedOperator = [OPERATORS.IN, OPERATORS.NOT_IN].includes(operator);
  const isEqualRelatedOperator = [OPERATORS.EQUAL, OPERATORS.NOT_EQUAL].includes(operator);
  const isEmptyRelatedOperator = [OPERATORS.EMPTY].includes(operator);
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
      entityTypeId={entityTypeId}
      testId={testId}
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
      entityTypeId={entityTypeId}
      availableValues={availableValues}
      onChange={(selectedItems) => onChange(selectedItems, index, COLUMN_KEYS.VALUE)}
      isMulti
      emptyMessage={emptyMessage}
      value={inputValue}
      {...rest}
    />
  );

  // DateType: treat value as plain YYYY-MM-DD (timezone agnostic) by setting the timezone to UTC and setting the backendDateStandard to YYYY-MM-DD
  const datePickerControl = () => (
    <Datepicker
      timeZone="UTC"
      backendDateStandard="YYYY-MM-DD"
      data-testid="data-input-dateType"
      onChange={(e, _unusedValue, formattedValue) => onChange(formattedValue, index, COLUMN_KEYS.VALUE)}
      {...rest}
      value={value || ''}
    />
  );

  // DateTimeType: timezone logic (store value without trailing Z after user selection)
  const dateTimePickerControl = () => {
    const selectedValue = value;
    const formattedSelectedDate = selectedValue ? `${selectedValue}Z` : selectedValue;

    return (
      <Datepicker
        timeZone={timezone}
        data-testid="data-input-dateTimeType"
        onChange={(e, _unusedValue, formattedValue) => {
          onChange(formattedValue.replace('Z', ''), index, COLUMN_KEYS.VALUE);
        }}
        {...rest}
        value={formattedSelectedDate}
      />
    );
  };

  const stringTypeControls = (testIdPostfix = 'stringType') => {
    const isInRelatedWithOptions = isInRelatedOperator && hasSourceOrValues;
    const isEqualRelatedWithOptions = isEqualRelatedOperator && hasSourceOrValues;

    const { organizationPluginButton, multiSelectionEmptyMessage } = getOrganizationPluginButton(
      source,
      isInRelatedWithOptions,
      onChange,
      value,
      index,
    );

    if (isInRelatedWithOptions) {
      return (
        <div className={className} data-testid={`data-input-select-multi-${testIdPostfix}`}>
          {multiSelectControl({ value, emptyMessage: multiSelectionEmptyMessage })}
          {organizationPluginButton}
        </div>
      );
    }

    if (isEqualRelatedWithOptions) {
      return (
        <div className={className}>
          {selectControl({ testId: `data-input-select-single-${testIdPostfix}`, value })}
          {organizationPluginButton}
        </div>
      );
    }

    return textControl({ testId: `data-input-text-${testIdPostfix}`, value });
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

  const enumTypeControls = () => {
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
    case DATA_TYPES.ArrayType:
    case DATA_TYPES.JsonbArrayType:
      return stringTypeControls(dataType);

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

    case DATA_TYPES.DateTimeType:
      return dateTimePickerControl();

    case DATA_TYPES.OpenUUIDType:
      return openUUIDTypeControls();

    case DATA_TYPES.EnumType:
      return enumTypeControls();

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
  source: PropTypes.shape({
    name: PropTypes.string,
    entityTypeId: PropTypes.string,
    columnName: PropTypes.string,
  }),
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
  entityTypeId: PropTypes.string,
};
