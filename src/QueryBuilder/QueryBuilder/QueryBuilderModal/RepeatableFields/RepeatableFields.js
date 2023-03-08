import React from 'react';
import {
  IconButton,
  RepeatableField,
  Select,
  Col,
  Row,
} from '@folio/stripes/components';

import PropTypes from 'prop-types';
import { QueryBuilderTitle } from '../../QueryBuilderTitle';
import css from '../QueryBuilderModal.css';
import { COLUMN_KEYS } from '../../constants/columnKeys';
import { booleanOptions, fieldOptions, getOperatorOptions, rowTemplate } from '../../helpers/selectOptions';
import { OPERATORS } from '../../constants/operators';
import { DataTypeInput } from '../DataTypeInput';

export const RepeatableFields = ({ rows, setRows }) => {
  const handleAdd = () => {
    setRows(res => ([
      ...res,
      {
        ...rowTemplate,
        [COLUMN_KEYS.BOOLEAN]: { options: booleanOptions, current: OPERATORS.AND },
      },
    ]));
  };

  const handleRemove = (index) => {
    const filteredFields = rows.filter((_, i) => i !== index);

    setRows(filteredFields);
  };

  const handleChange = (value, index, fieldName) => {
    let modifications = () => ({});
    const isField = fieldName === COLUMN_KEYS.FIELD;
    const field = fieldOptions.find(o => o.value === value);

    if (isField) {
      modifications = (item) => {
        return {
          [COLUMN_KEYS.FIELD]: {
            ...item[COLUMN_KEYS.FIELD],
            current: value,
            dataType: field.dataType,
          },
          [COLUMN_KEYS.OPERATOR]: {
            options: getOperatorOptions(field.dataType),
            current: '',
          },
          [COLUMN_KEYS.VALUE]: {
            options: field.values,
            current: '',
          },
        };
      };
    }

    setRows(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [fieldName]: {
            ...item[fieldName],
            current: value,
          },
          ...modifications(item),
        }
      }

      return item;
    }));
  };

  return (
    <>
      <QueryBuilderTitle results={rows} />
      <RepeatableField
        fields={rows}
        onAdd={() => {}}
        hasMargin={false}
        renderField={(row, index) => {
          return (
            <Row
              data-testid={`row-${index}`}
              className={`${css.row} ${index % 2 === 0 ? css.even : ''}`}
            >
              {rows.length > 1 && (
                <Col sm={1} className={css.rowCell}>
                  {index > 0 && (
                    <Select
                      selectClass={css.control}
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
                <Select
                  selectClass={css.control}
                  dataOptions={row.field.options}
                  value={row.field.current}
                  onChange={(e) => handleChange(e.target.value, index, COLUMN_KEYS.FIELD)}
                  data-testid={`field-option-${index}`}
                  aria-label={`field-option-${index}`}
                />
              </Col>

              <Col sm={2} className={css.rowCell}>
                {(row.field.current) && (
                  <Select
                    selectClass={css.control}
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
                  <>
                    {/* <TextField
                      className={css.control}
                      value={row.value.current}
                      onChange={(e) => handleChange(e.target.value, index, COLUMN_KEYS.VALUE)}
                      data-testid={`input-value-${index}`}
                      aria-label={`input-value-${index}`}
                    /> */}
                    <DataTypeInput
                      className={css.control}
                      value={row.value.current}
                      dataType={row.field.dataType}
                      availableValues={row.value.options}
                      onChange={(e) => handleChange(e.target.value, index, COLUMN_KEYS.VALUE)}
                      data-testid={`input-value-${index}`}
                      aria-label={`input-value-${index}`}
                    />
                  </>
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
                  disabled={index === 0}
                  data-testid={`remove-button-${index}`}
                />
              </Col>
            </Row>
          );
        }}
      />
    </>
  );
};

RepeatableFields.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object),
  setRows: PropTypes.func,
};
