import { useShowCallout } from '@folio/stripes-acq-components';
import {
  Col,
  getFirstFocusable,
  IconButton,
  RepeatableField,
  Row,
  Select,
  Selection,
} from '@folio/stripes/components';
import React, { memo, useEffect, useRef } from 'react';

import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { COLUMN_KEYS } from '../../../../constants/columnKeys';
import { BOOLEAN_OPERATORS } from '../../../../constants/operators';
import { DATA_TYPES } from '../../../../constants/dataTypes';
import { RootContext } from '../../../../context/RootContext';
import { findMissingValues } from '../../helpers/query';
import {
  booleanOptions,
  getFieldOptions,
  getFilteredOptions,
  fuzzyOptionFormatter,
  getOperatorOptions,
  hasValueOptions,
  REPEATABLE_FIELD_DELIMITER,
  sourceTemplate,
} from '../../helpers/selectOptions';
import {
  findMarcPlaceholder,
  getMarcSourcePrefix,
  MARC_DATA_TYPE,
  MARC_FIELD_SENTINEL,
  MARC_VALUE_DATA_TYPE,
} from '../../helpers/marcFields';
import { retainValueOnOperatorChange } from '../../helpers/valueBuilder';
import { getBooleanOperatorLabel } from '../../helpers/operatorLabels';
import { QueryBuilderTitle } from '../../QueryBuilderTitle';
import { DataTypeInput } from '../DataTypeInput';
import { MarcFieldControl } from '../MarcFieldControl';
import css from '../QueryBuilderModal.css';

export const getMemoizedValues = ({
  currentOptions,
  rowField,
  getDataOptions,
}) => (
  currentOptions || getDataOptions(rowField)
);

// Switches a row into MARC mode when the "MARC field" option is picked: there's no real field name yet
// (MarcFieldControl fills it in), so blank the field, mark it MARC, and clear the operator and value cells.
export const enterMarcFieldMode = (item) => ({
  [COLUMN_KEYS.FIELD]: {
    ...item[COLUMN_KEYS.FIELD],
    current: '',
    isMarc: true,
    dataType: MARC_DATA_TYPE,
  },
  [COLUMN_KEYS.OPERATOR]: { options: [], current: '' },
  [COLUMN_KEYS.VALUE]: { options: undefined, source: undefined, valueSourceApi: undefined, current: '' },
});

// Applies a MARC field selection to a row: sets the assembled field name and attaches its operator set. The MARC
// value is always free text, so the value cell is left as-is.
export const applyMarcFieldChange = ({ item, name, intl }) => {
  const options = getOperatorOptions({ dataType: DATA_TYPES.MarcType, fieldName: name, intl });
  const operatorStillValid = options.some((option) => option.value === item[COLUMN_KEYS.OPERATOR].current);

  return {
    ...item,
    [COLUMN_KEYS.FIELD]: {
      ...item[COLUMN_KEYS.FIELD],
      current: name,
      isMarc: true,
      dataType: MARC_VALUE_DATA_TYPE,
    },
    [COLUMN_KEYS.OPERATOR]: {
      ...item[COLUMN_KEYS.OPERATOR],
      options,
      current: operatorStillValid ? item[COLUMN_KEYS.OPERATOR].current : '',
    },
  };
};

export const RepeatableFields = memo(({ source, setSource, columns, entityTypeId }) => {
  const intl = useIntl();
  const callout = useShowCallout();
  const calloutCalledRef = useRef(false);

  const { getDataOptions } = React.useContext(RootContext);

  const fieldOptions = getFieldOptions(columns);

  // MARC fields aren't enumerable columns; a MARC-capable entity type is signaled by the generic marcType
  // placeholder column. When present, the field dropdown offers a "MARC field" entry that switches the row into
  // MARC mode.
  const marcPlaceholder = findMarcPlaceholder(columns);
  const marcSupported = Boolean(marcPlaceholder);
  const marcSourcePrefix = getMarcSourcePrefix(marcPlaceholder?.name);
  const marcFieldOption = {
    // Label with the fully-qualified (source-aware) name
    label: marcPlaceholder?.labelAliasFullyQualified
      || marcPlaceholder?.labelAlias
      || intl.formatMessage({ id: 'ui-plugin-query-builder.marc.fieldOption' }),
    value: MARC_FIELD_SENTINEL,
  };

  const handleAdd = () => {
    setSource(res => ([
      ...res,
      {
        ...sourceTemplate(fieldOptions),
        [COLUMN_KEYS.BOOLEAN]: { options: booleanOptions, current: BOOLEAN_OPERATORS.AND },
      },
    ]));
  };

  const handleRemove = (index) => {
    if (index === 0) {
      setSource((prevSource) => {
        const updatedSource = [...prevSource];

        if (updatedSource[1]?.boolean) {
          updatedSource[1].boolean.current = '';
        }

        return updatedSource;
      });
    }

    const filteredFields = source.filter((_, i) => i !== index);

    setSource(filteredFields);

    const previousRowSelector = `[class^=repeatableFieldItem-]:nth-child(${index})`;
    const previousRowElement = document.querySelector(previousRowSelector);

    if (previousRowElement) {
      const firstFocusableElement = getFirstFocusable(previousRowElement);

      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }
  };

  const handleChange = (value, index, fieldName) => {
    const field = fieldOptions.find(o => o.value === value) || {};
    const isField = fieldName === COLUMN_KEYS.FIELD;
    const isOperator = fieldName === COLUMN_KEYS.OPERATOR;
    const rowField = source[index].field.current;
    const memorizedFieldDataType = source[index].field.dataType;
    const memoizedFieldSource = source[index].value.source;
    const memoizedFieldValueSourceApi = source[index].value.valueSourceApi;
    const memorizedField = fieldOptions.find(o => o.value === rowField);
    const memorizedOperator = source[index].operator.current;
    const memoizedValues = getMemoizedValues({
      currentOptions: source[index].value.options,
      rowField,
      getDataOptions,
    });
    const memorizedValue = source[index].value.current;

    const modifications = (item) => {
      // Entering MARC mode: no real field name yet (MarcFieldControl fills it in), so reset operator/value.
      if (isField && value === MARC_FIELD_SENTINEL) {
        return enterMarcFieldMode(item);
      }

      if (isField) {
        return {
          [COLUMN_KEYS.FIELD]: {
            ...item[COLUMN_KEYS.FIELD],
            current: value,
            isMarc: false,
            dataType: field.dataType,
          },
          [COLUMN_KEYS.OPERATOR]: {
            options: getOperatorOptions({
              dataType: field.dataType,
              hasSourceOrValues: hasValueOptions(field),
              isFromNestedField: field.value.includes(REPEATABLE_FIELD_DELIMITER),
              fieldName: field.value,
              intl,
            }),
            current: '',
          },
          [COLUMN_KEYS.VALUE]: {
            options: field.values,
            source: field.source,
            valueSourceApi: field.valueSourceApi,
            current: '',
          },
        };
      }

      if (isOperator) {
        return {
          [COLUMN_KEYS.VALUE]: {
            // A MARC row's field name isn't in fieldOptions, so memorizedField is undefined; optional-chaining
            // leaves the value cell's options/source undefined, which is correct for a free-text MARC value.
            options: memorizedField?.values,
            source: memorizedField?.source,
            valueSourceApi: memorizedField?.valueSourceApi,
            current: retainValueOnOperatorChange({
              source: memoizedFieldSource,
              valueSourceApi: memoizedFieldValueSourceApi,
              dataType: memorizedFieldDataType,
              operator: memorizedOperator,
              newOperator: value,
              prevValue: memorizedValue,
              availableValues: memoizedValues,
            }),
          },
        };
      }

      return {};
    };

    setSource(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [fieldName]: {
            ...item[fieldName],
            current: value,
          },
          ...modifications(item),
        };
      }

      return item;
    }));
  };

  // MarcFieldControl emits the assembled field name (or '' while incomplete). Store the field and attach its
  // operator set, which getOperatorOptions derives from the name.
  const handleMarcFieldChange = (name, index) => {
    setSource(prev => prev.map((item, i) => (
      i === index ? applyMarcFieldChange({ item, name, intl }) : item
    )));
  };

  useEffect(() => {
    if (calloutCalledRef.current) return;

    const deletedFields = findMissingValues(fieldOptions, source);

    if (deletedFields.length >= 1) {
      calloutCalledRef.current = true;

      callout({
        type: 'warning',
        message: (
          <FormattedMessage
            id="ui-plugin-query-builder.warning.deletedField"
            values={{ value: intl.formatList(deletedFields) }}
          />
        ),
        timeout: 0,
      });
    }
  }, []);

  return (
    <>
      <QueryBuilderTitle results={source} />
      <RepeatableField
        fields={source}
        onAdd={() => {}}
        hasMargin={false}
        renderField={(row, index) => {
          return (
            <Row
              key={index}
              data-testid={`row-${index}`}
              className={`${css.row} ${index % 2 === 0 ? css.even : ''}`}
            >
              {source.length > 1 && (
                <Col sm={1} className={css.rowCell}>
                  {index > 0 && (
                    <Select
                      dataOptions={row.boolean.options.map((option) => ({
                        ...option,
                        label: getBooleanOperatorLabel(option.value, intl),
                      }))}
                      value={row.boolean.current}
                      onChange={(e) => handleChange(e.target.value, index, COLUMN_KEYS.BOOLEAN)}
                      data-testid={`boolean-option-${index}`}
                      aria-label={`boolean-option-${index}`}
                    />
                  )}
                </Col>
              )}
              <Col sm={4} className={css.rowCell}>
                <Selection
                  id={`field-option-${index}`}
                  emptyMessage={<></>}
                  placeholder={intl.formatMessage({ id: 'ui-plugin-query-builder.control.selection.placeholder' })}
                  dataOptions={marcSupported ? [marcFieldOption, ...row.field.options] : row.field.options}
                  value={row.field.isMarc ? MARC_FIELD_SENTINEL : row.field.current}
                  onFilter={getFilteredOptions}
                  formatter={fuzzyOptionFormatter}
                  onChange={(value) => handleChange(value, index, COLUMN_KEYS.FIELD)}
                />
                {row.field.isMarc && (
                  <MarcFieldControl
                    sourcePrefix={marcSourcePrefix}
                    value={row.field.current}
                    index={index}
                    onFieldChange={(name) => handleMarcFieldChange(name, index)}
                  />
                )}
              </Col>

              <Col sm={2} className={css.rowCell}>
                {(row.field.current) && (
                  <Select
                    dataOptions={row.operator.options}
                    value={row.operator.current}
                    onChange={(e) => handleChange(e.target.value, index, COLUMN_KEYS.OPERATOR)}
                    data-testid={`operator-option-${index}`}
                    aria-label={`operator-option-${index}`}
                  />
                )}
              </Col>

              <Col sm={4} className={css.rowCell}>
                {(row.operator.current) && (
                  <DataTypeInput
                    fieldName={row.field.current}
                    value={row.value.current}
                    dataType={row.field.dataType}
                    index={index}
                    availableValues={row.value.options}
                    source={row.value.source}
                    valueSourceApi={row.value.valueSourceApi}
                    operator={row.operator.current}
                    onChange={handleChange}
                    data-testid={`input-value-${index}`}
                    aria-label={`input-value-${index}`}
                    usePortal
                    entityTypeId={entityTypeId}
                  />
                )}
              </Col>
              <Col sm={1} className={css.rowCell}>
                <IconButton
                  icon="plus-sign"
                  size="medium"
                  onClick={handleAdd}
                  data-testid={`add-button-${index}`}
                />
                <IconButton
                  icon="trash"
                  onClick={() => handleRemove(index)}
                  disabled={source.length === 1}
                  data-testid={`remove-button-${index}`}
                />
              </Col>
            </Row>
          );
        }}
      />
    </>
  );
});

RepeatableFields.propTypes = {
  source: PropTypes.arrayOf(PropTypes.shape({})),
  columns: PropTypes.arrayOf(PropTypes.shape({})),
  setSource: PropTypes.func,
  entityTypeId: PropTypes.string,
};
