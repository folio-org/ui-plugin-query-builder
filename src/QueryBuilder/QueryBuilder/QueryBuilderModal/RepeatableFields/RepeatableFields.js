import React, { memo, useContext, useEffect, useRef } from 'react';
import {
  IconButton,
  RepeatableField,
  Select,
  Selection,
  Col,
  Row,
  getFirstFocusable,
} from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';

import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { QueryBuilderTitle } from '../../QueryBuilderTitle';
import css from '../QueryBuilderModal.css';
import { COLUMN_KEYS } from '../../../../constants/columnKeys';
import {
  booleanOptions,
  getFieldOptions,
  getFilteredOptions,
  getOperatorOptions,
  sourceTemplate,
} from '../../helpers/selectOptions';
import { BOOLEAN_OPERATORS } from '../../../../constants/operators';
import { DataTypeInput } from '../DataTypeInput';
import { findMissingValues } from '../../helpers/query';
import { retainValueOnOperatorChange } from '../../helpers/valueBuilder';
import { RootContext } from '../../../../context/RootContext';

export const RepeatableFields = memo(({ source, setSource, getParamsSource, columns }) => {
  const intl = useIntl();
  const callout = useShowCallout();
  const calloutCalledRef = useRef(false);
  const { getDataOptions } = useContext(RootContext);

  const fieldOptions = getFieldOptions(columns);

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
    const memorizedField = fieldOptions.find(o => o.value === rowField);
    const memorizedOperator = source[index].operator.current;
    const memorizedValue = source[index].value.current;
    const modifications = (item) => {
      if (isField) {
        return {
          [COLUMN_KEYS.FIELD]: {
            ...item[COLUMN_KEYS.FIELD],
            current: value,
            dataType: field.dataType,
          },
          [COLUMN_KEYS.OPERATOR]: {
            options: getOperatorOptions({
              dataType: field.dataType,
              hasSourceOrValues: field.values || field.source,
              intl,
            }),
            current: '',
          },
          [COLUMN_KEYS.VALUE]: {
            options: field.values,
            source: field.source,
            current: '',
          },
        };
      }

      if (isOperator) {
        return {
          [COLUMN_KEYS.VALUE]: {
            options: memorizedField.values,
            source: memorizedField.source,
            current: retainValueOnOperatorChange(
              memorizedOperator,
              value,
              memorizedFieldDataType,
              memorizedValue,
              getDataOptions(memorizedField.value),
            ),
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
                      dataOptions={row.boolean.options}
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
                  dataOptions={row.field.options}
                  value={row.field.current}
                  onFilter={getFilteredOptions}
                  onChange={(value) => handleChange(value, index, COLUMN_KEYS.FIELD)}
                />
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
                    getParamsSource={getParamsSource}
                    dataType={row.field.dataType}
                    index={index}
                    availableValues={row.value.options}
                    source={row.value.source}
                    operator={row.operator.current}
                    onChange={handleChange}
                    data-testid={`input-value-${index}`}
                    aria-label={`input-value-${index}`}
                    usePortal
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
  source: PropTypes.arrayOf(PropTypes.object),
  columns: PropTypes.arrayOf(PropTypes.object),
  setSource: PropTypes.func,
  getParamsSource: PropTypes.func,
};
