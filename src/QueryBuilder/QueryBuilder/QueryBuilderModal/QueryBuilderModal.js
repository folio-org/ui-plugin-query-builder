import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal,
  ModalFooter,
  Button,
  Headline } from '@folio/stripes/components';

import css from './QueryBuilderModal.css';
import { rowTemplate } from '../helpers/selectOptions';
import { getQueryStr } from '../helpers/query';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { COLUMN_KEYS } from '../constants/columnKeys';
import { TestQuery } from '../TestQuery/TestQuery';

export const QueryBuilderModal = ({
  setIsModalShown,
  isOpen = true,
}) => {
  const [rows, setRows] = useState([rowTemplate]);
  const [isQueryRetrieved, setIsQueryRetrieved] = useState(false);

  const query = getQueryStr(rows);

  const isQueryFilled = rows.every(row => row[COLUMN_KEYS.FIELD].current
    && row[COLUMN_KEYS.OPERATOR].current
    && row[COLUMN_KEYS.VALUE].current?.length);

  const handleCancel = () => {
    setIsModalShown(false);
  };

  const renderFooter = () => (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        disabled={!isQueryRetrieved}
        onClick={handleCancel}
      >
        <FormattedMessage id="ui-plugin-query-builder.modal.run" />
      </Button>
      <Button
        onClick={handleCancel}
      >
        <FormattedMessage id="ui-plugin-query-builder.modal.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      footer={renderFooter()}
      label={<FormattedMessage id="ui-plugin-query-builder.trigger" />}
      size="large"
      contentClass={css.modalClass}
      enforceFocus={false}
    >
      <Headline size="medium" margin="none" tag="h3">
        <FormattedMessage id="ui-plugin-query-builder.modal.query" />
      </Headline>
      <div className={css.queryArea}>
        {query}
      </div>
      <RepeatableFields rows={rows} setRows={setRows} />
      <TestQuery
        isTestBtnDisabled={!isQueryFilled}
        query={query}
        onQueryRetrieved={() => setIsQueryRetrieved(true)}
        onTestQuery={() => setIsQueryRetrieved(false)}
      />
    </Modal>
  );
};

QueryBuilderModal.propTypes = {
  setIsModalShown: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};
