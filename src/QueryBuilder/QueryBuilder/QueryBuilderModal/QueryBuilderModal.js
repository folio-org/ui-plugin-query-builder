import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  TextArea,
  Select,
  IconButton,
  RepeatableField,
  Row,
  Col,
  TextField,
} from '@folio/stripes/components';
import css from './QueryBuilderModal.css';
import { QueryBuilderTitle } from '../QueryBuilderTitle';

const operatorsMock = [
  { value: '', label: 'Select operator' },
  { label: '<', value: '<' },
  { label: '<', value: '==' },
];
const booleanMock = [
  { label: 'AND', value: 'AND' },
];

const fieldsMock = [
  { value: '', label: 'Select field' },
  { value: 'status', label: 'status' },
  { value: 'patronGroup', label: 'Patron group' },
];

export const QueryBuilderModal = ({
  setIsModalShown,
  isOpen,
}) => {
  const intl = useIntl();
  const [results, setResults] = useState([{ field: '' }]);
  const modalLabel = intl.formatMessage({ id: 'ui-plugin-query-builder.trigger' });
  const cancelLabel = intl.formatMessage({ id: 'ui-plugin-query-builder.modal.cancel' });
  const confirmLabel = intl.formatMessage({ id: 'ui-plugin-query-builder.modal.run' });
  const queryLabel = intl.formatMessage({ id: 'ui-plugin-query-builder.modal.query' });
  const testQueryLabel = intl.formatMessage({ id: 'ui-plugin-query-builder.modal.test' });

  const handleCancel = () => {
    setIsModalShown(false);
  };

  const handleAdd = () => {
    setResults(res => ([...res, {}]));
  };

  const handleRemove = (index) => {
    const filteredFields = results.filter((_, i) => i !== index);

    setResults(filteredFields);
  };

  const handleChange = (e, index, fieldName) => {
    setResults(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [fieldName]: e.target.value,
        };
      }

      return item;
    }));
  };

  const renderFooter = () => (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        disabled
        onClick={handleCancel}
      >
        {confirmLabel}
      </Button>
      <Button
        onClick={handleCancel}
      >
        {cancelLabel}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      footer={renderFooter()}
      label={modalLabel}
    >
      <TextArea
        value="query"
        rows="1"
        label={queryLabel}
        disabled
      />
      <QueryBuilderTitle results={results} />
      <RepeatableField
        fields={results}
        onAdd={() => {}}
        className={css.repitableContainer}
        renderField={(field, index) => {
          return (
            <Row data-testid={`row-${index}`} className={css.row}>
              {results.length > 1 && (
                <Col sm={2}>
                  {index > 0 && (
                    <Select
                      dataOptions={booleanMock}
                      value={field.boolean}
                      onChange={(e) => handleChange(e, index, 'boolean')}
                      data-testid={`boolean-option-${index}`}
                      aria-label={`boolean-option-${index}`}
                    />
                  )}
                </Col>
              )}
              <Col className={css.col}>
                <Select
                  dataOptions={fieldsMock}
                  value={field.field}
                  onChange={(e) => handleChange(e, index, 'field')}
                  data-testid={`field-option-${index}`}
                  aria-label={`field-option-${index}`}
                />
              </Col>
              {(field.field || results.length > 1) && (
                <Col sm={2}>
                  <Select
                    dataOptions={operatorsMock}
                    value={field.operator}
                    onChange={(e) => handleChange(e, index, 'operator')}
                    data-testid={`operator-option-${index}`}
                    aria-label={`operator-option-${index}`}
                  />
                </Col>
              )}
              {(field.operator || results.length > 1) && (
                <Col sm={4}>
                  <TextField
                    value={field.value}
                    onChange={(e) => handleChange(e, index, 'value')}
                    data-testid={`input-value-${index}`}
                    aria-label={`input-value-${index}`}
                  />
                </Col>
              )}
              <Col sm={2}>
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
      <Button disabled>
        {testQueryLabel}
      </Button>
    </Modal>
  );
};

QueryBuilderModal.propTypes = {
  setIsModalShown: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};
