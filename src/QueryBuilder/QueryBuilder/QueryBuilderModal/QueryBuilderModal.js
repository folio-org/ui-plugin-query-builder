import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal,
  ModalFooter,
  Button,
  Headline } from '@folio/stripes/components';

import css from './QueryBuilderModal.css';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { TestQuery } from '../TestQuery/TestQuery';
import { useRunQuery } from '../hooks/useRunQuery';
import { useQuerySource } from '../hooks/useQuerySource';
import { useEntityType } from '../../../hooks/useEntityType';

export const QueryBuilderModal = ({
  setIsModalShown,
  isOpen = true,
  saveBtnLabel,
  initialValues,
  runQuerySource,
  testQuerySource,
  onQueryRun,
  entityTypeDataSource = () => {},
  getParamsSource,
}) => {
  const { entityType } = useEntityType(entityTypeDataSource);
  const { source,
    setSource,
    fqlQuery,
    isQueryFilled,
    queryStr } = useQuerySource(initialValues, entityType);
  const [isQueryRetrieved, setIsQueryRetrieved] = useState(false);
  const [testedQueryId, setTestedQueryId] = useState(false);

  const { runQuery } = useRunQuery({
    onQueryRun: (result) => onQueryRun({ result, queryStr, fqlQuery }),
    runQuerySource,
    testedQueryId,
    fqlQuery,
  });

  const handleSetSource = (src) => {
    setIsQueryRetrieved(false); // invalidate flag if form value was changed
    setSource(src);
  };

  const handleCancel = () => {
    setIsModalShown(false);
  };

  const handleRun = () => {
    runQuery().finally(handleCancel);
  };

  const handleQueryTested = ({ queryId }) => {
    setTestedQueryId(queryId);
    setIsQueryRetrieved(false);
  };

  const getSaveBtnLabel = () => (saveBtnLabel || <FormattedMessage id="ui-plugin-query-builder.modal.run" />);

  const renderFooter = () => (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        disabled={!isQueryRetrieved || !isQueryFilled}
        onClick={handleRun}
      >
        {getSaveBtnLabel()}
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
        {queryStr}
      </div>
      <RepeatableFields source={source} setSource={handleSetSource} getParamsSource={getParamsSource} />
      <TestQuery
        fqlQuery={fqlQuery}
        testQuerySource={testQuerySource}
        isTestBtnDisabled={!isQueryFilled}
        onQueryRetrieved={() => setIsQueryRetrieved(true)}
        onQueryTested={handleQueryTested}
      />
    </Modal>
  );
};

QueryBuilderModal.propTypes = {
  setIsModalShown: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  saveBtnLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  initialValues: PropTypes.object,
  runQuerySource: PropTypes.func.isRequired,
  testQuerySource: PropTypes.func.isRequired,
  onQueryRun: PropTypes.func,
  entityTypeDataSource: PropTypes.func,
  getParamsSource: PropTypes.func,
};
