import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal,
  ModalFooter,
  Button,
  Headline } from '@folio/stripes/components';

import css from './QueryBuilderModal.css';
import { booleanOptions, fieldOptions, sourceTemplate } from '../helpers/selectOptions';
import { getQueryStr, isQueryValid, mongoQueryToSource, sourceToMongoQuery } from '../helpers/query';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { TestQuery } from '../TestQuery/TestQuery';

export const QueryBuilderModal = ({
  isOpen = true,
  setIsModalShown,
  initialValues = {
    '$and': [
      {
        'user_last_name': {
          '$eq': 'qqq',
        },
      },
      {
        'user_patron_group': {
          '$eq': [
            {
              'label': 'UC Academic, Indefinite',
              'value': 'Indefinite',
            },
            {
              'label': 'UC Department, Quarter',
              'value': 'Quarter',
            },
          ],
        },
      },
      {
        'instance_title': {
          '$regex': '/^bbbb/i',
        },
      },
      {
        'user_first_name': {
          '$regex': '/cccc/i',
        },
      },
    ],
  },
}) => {
  const sourceInitialValue = initialValues
    ? mongoQueryToSource({
      mongoQuery: initialValues,
      fieldOptions,
      booleanOptions,
    })
    : [sourceTemplate];
  const [source, setSource] = useState(sourceInitialValue);
  const [isQueryRetrieved, setIsQueryRetrieved] = useState(false);

  const query = getQueryStr(source);

  const isQueryFilled = isQueryValid(source);

  const handleCancel = () => {
    setIsModalShown(false);
  };

  const handleRun = () => {
    console.log(sourceToMongoQuery(source));
    handleCancel();
  };

  const renderFooter = () => (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        disabled={!isQueryRetrieved && isQueryFilled}
        onClick={handleRun}
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
      <RepeatableFields source={source} setSource={setSource} />
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
  initialValues: PropTypes.object,
};
