import React from 'react';
import {
  IconButton,
  RepeatableField,
  Select,
  Selection,
  Col,
  Row,
} from '@folio/stripes/components';

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { QueryBuilderTitle } from '../../QueryBuilderTitle';
import css from '../QueryBuilderModal.css';
import { COLUMN_KEYS } from '../../constants/columnKeys';
import { booleanOptions, fieldOptions, getOperatorOptions, sourceTemplate } from '../../helpers/selectOptions';
import { OPERATORS } from '../../constants/operators';
import { DataTypeInput } from '../DataTypeInput';

export const RepeatableFields = ({ source, setSource, getParamsSource }) => {
  const intl = useIntl();
  const handleAdd = () => {
    setSource(res => ([
      ...res,
      {
        ...sourceTemplate,
        [COLUMN_KEYS.BOOLEAN]: { options: booleanOptions, current: OPERATORS.AND },
      },
    ]));
  };

  const handleRemove = (index) => {
    const filteredFields = source.filter((_, i) => i !== index);

    setSource(filteredFields);
  };

  const handleChange = (value, index, fieldName) => {
    const isField = fieldName === COLUMN_KEYS.FIELD;
    const isOperator = fieldName === COLUMN_KEYS.OPERATOR;
    const field = fieldOptions.find(o => o.value === value);
    const rowField = source[index].field.current;
    const memorizedField = fieldOptions.find(o => o.value === rowField);

    const modifications = (item) => {
      if (isField) {
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
      }
      if (isOperator) {
        return {
          [COLUMN_KEYS.VALUE]: {
            options: memorizedField.values,
            current: '',
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

  return (
    <>
      <QueryBuilderTitle results={source} />
      <RepeatableField
        fields={source}
        onAdd={() => {}}
        hasMargin={false}
        renderField={(row, index) => {
          console.log(row.value);

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
                  placeholder={intl.formatMessage({ id: 'ui-plugin-query-builder.control.selection.placeholder' })}
                  dataOptions={row.field.options}
                  value={row.field.current}
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
                    value={row.value.current}
                    getParamsSource={getParamsSource}
                    dataType={row.field.dataType}
                    index={index}
                    availableValues={row.value.options}
                    source={row.field?.options?.find((el) => el.value === row.field.current)}
                    operator={row.operator.current}
                    onChange={handleChange}
                    data-testid={`input-value-${index}`}
                    aria-label={`input-value-${index}`}
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
  source: PropTypes.arrayOf(PropTypes.object),
  setSource: PropTypes.func,
  getParamsSource: PropTypes.func,
};
