import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  Headline,
  Loading,
  Row,
} from '@folio/stripes/components';

import css from './QueryBuilderModal.css';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { TestQuery } from '../TestQuery/TestQuery';
import { useRunQuery } from '../hooks/useRunQuery';
import { useQuerySource } from '../hooks/useQuerySource';
import { queryBuilderModalPropTypes } from '../../propTypes';
import { QUERY_DETAILS_STATUSES } from '../constants/query';
import { useEntityType } from '../../../hooks/useEntityType';
import { getFieldOptions } from '../helpers/selectOptions';

export const QueryBuilderModal = ({
  isOpen = true,
  setIsModalShown,
  saveBtnLabel,
  initialValues,
  entityTypeDataSource,
  runQueryDataSource,
  testQueryDataSource,
  queryDetailsDataSource,
  onQueryRunSuccess,
  onQueryRunFail,
  getParamsSource,
}) => {
  const { entityType } = useEntityType({ entityTypeDataSource });
  const {
    source,
    setSource,
    fqlQuery,
    isQueryFilled,
    queryStr,
  } = useQuerySource(initialValues, entityType);
  const [isQueryRetrieved, setIsQueryRetrieved] = useState(false);
  const [testedQueryId, setTestedQueryId] = useState(false);

  const { runQuery, isRunQueryLoading } = useRunQuery({
    runQueryDataSource,
    onQueryRunSuccess,
    onQueryRunFail,
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
    runQuery({
      queryId: testedQueryId,
      fqlQuery,
    }).then(handleCancel);
  };

  const handleQueryTestSuccess = ({ queryId }) => {
    setTestedQueryId(queryId);
    setIsQueryRetrieved(false);
  };

  const handleQueryRetrieved = (data) => {
    const completed = data?.status === QUERY_DETAILS_STATUSES.SUCCESS;

    setIsQueryRetrieved(completed);
  };

  const getSaveBtnLabel = () => (saveBtnLabel || <FormattedMessage id="ui-plugin-query-builder.modal.run" />);

  const renderFooter = () => (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        disabled={!isQueryRetrieved || !isQueryFilled || isRunQueryLoading}
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

      {!entityType ? (
        <Row center="xs">
          <Loading size="large" />
        </Row>
      ) : (
        <>
          <RepeatableFields
            source={source}
            setSource={handleSetSource}
            getParamsSource={getParamsSource}
            fieldOptions={getFieldOptions(entityType)}
          />
          <TestQuery
            fqlQuery={fqlQuery}
            testQueryDataSource={testQueryDataSource}
            entityTypeDataSource={entityTypeDataSource}
            queryDetailsDataSource={queryDetailsDataSource}
            onQueryTestSuccess={handleQueryTestSuccess}
            isQueryFilled={!isQueryFilled}
            onQueryRetrieved={handleQueryRetrieved}
            entityTypeId={entityType?.id}
          />
        </>
      )}

    </Modal>
  );
};

QueryBuilderModal.propTypes = queryBuilderModalPropTypes;
