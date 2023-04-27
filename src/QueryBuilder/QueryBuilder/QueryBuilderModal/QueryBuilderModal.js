import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  Headline,
  Loading,
  Row,
} from '@folio/stripes/components';

import { useQueryClient } from '@tanstack/react-query';
import css from './QueryBuilderModal.css';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { TestQuery } from '../TestQuery/TestQuery';
import { useRunQuery } from '../../../hooks/useRunQuery';
import { useQuerySource } from '../../../hooks/useQuerySource';
import { queryBuilderModalPropTypes } from '../../propTypes';
import { QUERY_DETAILS_STATUSES, QUERY_KEYS } from '../../../constants/query';
import { useEntityType } from '../../../hooks/useEntityType';
import { getFieldOptions } from '../helpers/selectOptions';
import { useCancelQuery } from '../../../hooks/useCancelQuery';

export const QueryBuilderModal = ({
  isOpen = true,
  setIsModalShown,
  saveBtnLabel,
  initialValues,
  entityTypeDataSource,
  runQueryDataSource,
  testQueryDataSource,
  cancelQueryDataSource,
  queryDetailsDataSource,
  onQueryRunSuccess,
  onQueryRunFail,
  onQueryExecutionSuccess,
  onQueryExecutionFail,
  getParamsSource,
}) => {
  const queryClient = useQueryClient();

  const [testedQueryId, setTestedQueryId] = useState(null);
  const { entityType } = useEntityType({ entityTypeDataSource });
  const { cancelQuery } = useCancelQuery({ cancelQueryDataSource });

  const {
    source,
    setSource,
    fqlQuery,
    isQueryFilled,
    queryStr,
  } = useQuerySource({
    mongoQuery: initialValues,
    entityType,
  });

  const [isQueryRetrieved, setIsQueryRetrieved] = useState(false);

  const { runQuery, isRunQueryLoading } = useRunQuery({
    queryId: testedQueryId,
    runQueryDataSource,
    onQueryRunSuccess,
    onQueryRunFail,
    fqlQuery,
  });

  const handleSetSource = (src) => {
    setIsQueryRetrieved(false); // invalidate flag if form value was changed
    setSource(src);
  };

  const handleCancelQuery = async () => {
    if (testedQueryId) {
      await cancelQuery({ queryId: testedQueryId });

      queryClient.removeQueries({ queryKey: [QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA] });

      setTestedQueryId(null);
    }
  };
  const handleCancelModal = async () => {
    await handleCancelQuery();

    setIsModalShown(false);
  };

  const handleRun = async () => {
    await runQuery({
      queryId: testedQueryId,
      fqlQuery,
    });

    await handleCancelModal();
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

  useEffect(() => {
    handleCancelQuery();
  }, [source]);

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
        onClick={handleCancelModal}
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
            isQueryFilled={isQueryFilled}
            onQueryRetrieved={handleQueryRetrieved}
            entityTypeId={entityType?.id}
            onQueryExecutionFail={onQueryExecutionFail}
            onQueryExecutionSuccess={onQueryExecutionSuccess}
          />
        </>
      )}

    </Modal>
  );
};

QueryBuilderModal.propTypes = queryBuilderModalPropTypes;
