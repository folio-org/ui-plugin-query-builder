import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  Headline,
  Loading,
  Row,
} from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';
import { useQueryClient } from '@tanstack/react-query';
import css from './QueryBuilderModal.css';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { TestQuery } from '../TestQuery/TestQuery';
import { useRunQuery } from '../../../hooks/useRunQuery';
import { getSourceValue, useQuerySource } from '../../../hooks/useQuerySource';
import { queryBuilderModalPropTypes } from '../../propTypes';
import { QUERY_DETAILS_STATUSES, QUERY_KEYS } from '../../../constants/query';
import { useEntityType } from '../../../hooks/useEntityType';
import { useCancelQuery } from '../../../hooks/useCancelQuery';
import { useTestQuery } from '../../../hooks/useTestQuery';
import { getFieldOptions } from '../helpers/selectOptions';
import upgradeInitialValues from '../helpers/upgradeInitialValues';

export const QueryBuilderModal = ({
  isOpen,
  setIsModalShown,
  saveBtnLabel,
  initialValues: originalInitialValues,
  entityTypeDataSource,
  runQueryDataSource,
  testQueryDataSource,
  cancelQueryDataSource,
  queryDetailsDataSource,
  onQueryRunSuccess,
  onQueryRunFail,
  onQueryExecutionSuccess,
  onQueryExecutionFail,
  onSetDefaultVisibleColumns,
  recordColumns,
  getParamsSource,
  recordsLimit,
  additionalControls,
  canRunEmptyQuery = true,
}) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const showCallout = useShowCallout();

  const { entityType } = useEntityType({ entityTypeDataSource });

  const { cancelQuery } = useCancelQuery({ cancelQueryDataSource });

  const initialValues = useMemo(
    () => upgradeInitialValues(originalInitialValues, entityType),
    [originalInitialValues, entityType],
  );

  const {
    source,
    setSource,
    fqlQuery,
    isQueryFilled,
    queryStr,
    isSourceInit,
  } = useQuerySource({
    getParamsSource,
    initialValues,
    entityType,
  });

  const [isQueryRetrieved, setIsQueryRetrieved] = useState(false);
  const [recordsLimitExceeded, setRecordsLimitExceeded] = useState(false);

  const {
    queryId,
    testQuery,
    resetTestQuery,
    isTestQueryLoading,
    isPreviewLoading,
    setIsPreviewLoading,
    isTestQueryInProgress,
    setIsTestQueryInProgress,
  } = useTestQuery({
    testQueryDataSource,
    onQueryTestSuccess: () => {
      setIsQueryRetrieved(false);
    },
    onQueryTestFail: async (err) => {
      const response = await err?.response?.json();
      const message = response?.message || <FormattedMessage id="ui-plugin-query-builder.error.sww" />;

      showCallout({
        message,
        type: 'error',
      });
      setIsQueryRetrieved(false);
    },
  });

  const { runQuery, isRunQueryLoading } = useRunQuery({
    onQueryRunSuccess,
    queryId,
    runQueryDataSource,
    onQueryRunFail,
  });

  const handleSetSource = (src) => {
    setIsQueryRetrieved(false); // invalidate flag if form value was changed
    setSource(src);
  };

  const handleCancelQuery = async () => {
    if (queryId) {
      setIsTestQueryInProgress(false);
      setIsPreviewLoading(false);
      setRecordsLimitExceeded(false);

      queryClient.removeQueries({ queryKey: [QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA] });

      resetTestQuery();

      await cancelQuery({ queryId });
    }
  };

  const handleCloseModal = async (isCancel = true) => {
    if (isCancel) {
      await handleCancelQuery();
    }

    const src = await getSourceValue({
      initialValues,
      fieldOptions: getFieldOptions(entityType?.columns),
      intl,
      getParamsSource,
    });

    setSource(src);

    setIsModalShown(false);
  };

  const handleRun = async () => {
    await runQuery({
      queryId,
      fqlQuery,
    });

    await handleCloseModal(false);
  };

  const handleQueryRetrieved = (data) => {
    const completed = data?.status === QUERY_DETAILS_STATUSES.SUCCESS;

    setIsQueryRetrieved(completed);
  };

  const getSaveBtnLabel = () => (saveBtnLabel || <FormattedMessage id="ui-plugin-query-builder.modal.run" />);

  useEffect(() => {
    if (isTestQueryInProgress) {
      handleCancelQuery();
    }
  }, [source, isTestQueryInProgress]);

  const isRunQueryDisabled = !isQueryRetrieved
    || !isQueryFilled
    || isRunQueryLoading
    || (!canRunEmptyQuery && entityType?.columns)
    || recordsLimitExceeded;

  const renderFooter = () => (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        disabled={isRunQueryDisabled}
        onClick={handleRun}
      >
        {getSaveBtnLabel()}
      </Button>
      <Button
        onClick={handleCloseModal}
      >
        <FormattedMessage id="ui-plugin-query-builder.modal.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      open={isOpen}
      footer={renderFooter()}
      onClose={handleCloseModal}
      dismissible
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

      {!entityType && isSourceInit ? (
        <Row center="xs">
          <Loading size="large" />
        </Row>
      ) : (
        <>
          <RepeatableFields
            source={source}
            setSource={handleSetSource}
            getParamsSource={getParamsSource}
            columns={entityType?.columns}
          />
          <TestQuery
            queryId={queryId}
            testQuery={testQuery}
            isTestQueryLoading={isTestQueryLoading}
            fqlQuery={fqlQuery}
            recordColumns={recordColumns}
            onSetDefaultVisibleColumns={onSetDefaultVisibleColumns}
            testQueryDataSource={testQueryDataSource}
            entityTypeDataSource={entityTypeDataSource}
            queryDetailsDataSource={queryDetailsDataSource}
            isQueryFilled={isQueryFilled}
            onQueryRetrieved={handleQueryRetrieved}
            entityTypeId={entityType?.id}
            onQueryExecutionFail={onQueryExecutionFail}
            onQueryExecutionSuccess={onQueryExecutionSuccess}
            isPreviewLoading={isPreviewLoading}
            setIsPreviewLoading={setIsPreviewLoading}
            isTestQueryInProgress={isTestQueryInProgress}
            setIsTestQueryInProgress={setIsTestQueryInProgress}
            recordsLimitExceeded={recordsLimitExceeded}
            setRecordsLimitExceeded={setRecordsLimitExceeded}
            recordsLimit={recordsLimit}
            additionalControls={additionalControls}
          />
        </>
      )}

    </Modal>
  );
};

QueryBuilderModal.propTypes = queryBuilderModalPropTypes;
