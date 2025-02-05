import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  Headline,
  Loading,
  Row,
  StripesOverlayWrapper,
} from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';
import { useQueryClient } from 'react-query';
import { useNamespace } from '@folio/stripes/core';
import css from './QueryBuilderModal.css';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { TestQuery } from '../TestQuery/TestQuery';
import { useRunQuery } from '../../../hooks/useRunQuery';
import { getSourceValue, useQuerySource } from '../../../hooks/useQuerySource';
import { queryBuilderModalPropTypes } from '../../propTypes';
import { QUERY_DETAILS_STATUSES, QUERY_KEYS } from '../../../constants/query';
import { useCancelQuery } from '../../../hooks/useCancelQuery';
import { useEntityType } from '../../../hooks/useEntityType';
import { useFqmVersion } from '../../../hooks/useFqmVersion';
import { useTestQuery } from '../../../hooks/useTestQuery';
import { getFieldOptions } from '../helpers/selectOptions';
import upgradeInitialValues from '../helpers/upgradeInitialValues';
import { RootContext } from '../../../context/RootContext';

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
  const [entityKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_ENTITY_TYPE });
  const [entityPreviewKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_PREVIEW_ENTITY_TYPE });
  const [dataOptions, setDataOptions] = useState([]);

  const memoizedDataOptions = useMemo(() => ({ setDataOptions, dataOptions }), [setDataOptions, dataOptions]);

  const [contentDataKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA });
  const showCallout = useShowCallout();

  const { entityType, isEntityTypeFetching } = useEntityType({
    entityTypeDataSource,
    queryKey: entityKey,
    sharedOptions: {
      cacheTime: 0,
      staleTime: 0,
    },
  });

  const fqmVersion = useFqmVersion();

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
  } = useQuerySource({
    getParamsSource,
    initialValues,
    entityType,
    dataOptions,
  });

  const [isQueryRetrieved, setIsQueryRetrieved] = useState(false);
  const [recordsLimitExceeded, setRecordsLimitExceeded] = useState(false);
  const [isQueryEmpty, setIsQueryEmpty] = useState(false);

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
    fqmVersion,
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
        timeout: 6000, // from https://ux.folio.org/docs/guidelines/components/callout/
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

      queryClient.removeQueries({ queryKey: [contentDataKey] });

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

    queryClient.removeQueries({ queryKey: [entityKey] });
    queryClient.removeQueries({ queryKey: [entityPreviewKey] });

    setSource(src);
    setIsModalShown(false);
  };

  const handleRun = async () => {
    await runQuery({
      queryId,
      fqlQuery: { ...fqlQuery, _version: fqmVersion },
      userFriendlyQuery: queryStr,
    });

    await handleCloseModal(false);
  };

  const handleQueryRetrieved = (data) => {
    const completed = data?.status === QUERY_DETAILS_STATUSES.SUCCESS;

    setIsQueryEmpty(!data?.totalRecords);

    setIsQueryRetrieved(completed);
  };

  const forcedVisibleValues = source?.map(el => el?.field.current);

  const getSaveBtnLabel = () => (saveBtnLabel || <FormattedMessage id="ui-plugin-query-builder.modal.run" />);

  useEffect(() => {
    if (isTestQueryInProgress) {
      handleCancelQuery();
    }
  }, [source, isTestQueryInProgress]);

  const isRunQueryDisabled = !isQueryRetrieved
    || !isQueryFilled
    || isRunQueryLoading
    || (!canRunEmptyQuery && isQueryEmpty)
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
    <RootContext.Provider value={memoizedDataOptions}>
      <Modal
        open={isOpen}
        footer={renderFooter()}
        onClose={handleCloseModal}
        dismissible
        label={<FormattedMessage id="ui-plugin-query-builder.trigger" />}
        size="large"
        contentClass={css.modalClass}
        enforceFocus
      >
        <Headline size="medium" margin="none" tag="h3">
          <FormattedMessage id="ui-plugin-query-builder.modal.query" />
        </Headline>
        <div className={css.queryArea}>
          {queryStr}
        </div>

        {isEntityTypeFetching ? (
          <Row center="xs">
            <Loading size="large" />
          </Row>
        ) : (
          <StripesOverlayWrapper>
            <RepeatableFields
              source={source}
              setSource={handleSetSource}
              getParamsSource={getParamsSource}
              columns={entityType?.columns}
            />
            <TestQuery
              queryId={queryId}
              testQuery={testQuery}
              forcedVisibleValues={forcedVisibleValues}
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
          </StripesOverlayWrapper>
        )}

      </Modal>
    </RootContext.Provider>
  );
};

QueryBuilderModal.propTypes = queryBuilderModalPropTypes;
