import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Pane,
  Layer,
  PaneFooter,
  Button,
  Headline,
  Loading,
  Row,
  StripesOverlayWrapper,
  Layout,
} from '@folio/stripes/components';
import { useShowCallout } from '@folio/stripes-acq-components';
import { useQueryClient } from 'react-query';
import { useNamespace } from '@folio/stripes/core';
import css from './QueryBuilderModal.css';
import { RepeatableFields } from './RepeatableFields/RepeatableFields';
import { TestQuery } from '../TestQuery/TestQuery';
import { getSourceValue } from '../helpers/query';
import { useRunQuery } from '../../../hooks/useRunQuery';
import { useQuerySource } from '../../../hooks/useQuerySource';
import { queryBuilderModalPropTypes } from '../../propTypes';
import { QUERY_DETAILS_STATUSES, QUERY_KEYS } from '../../../constants/query';
import { useCancelQuery } from '../../../hooks/useCancelQuery';
import { useEntityType } from '../../../hooks/useEntityType';
import { useFqmVersion } from '../../../hooks/useFqmVersion';
import { useTestQuery } from '../../../hooks/useTestQuery';
import { getFieldOptions, REPEATABLE_FIELD_DELIMITER } from '../helpers/selectOptions';
import upgradeInitialValues from '../helpers/upgradeInitialValues';
import { RootContext } from '../../../context/RootContext';

export const QueryBuilderModal = ({
  isOpen,
  paneSub,
  getEntityTypeLabel,
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
  recordsLimit,
  additionalControls,
  canRunEmptyQuery = true,
}) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [entityKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_ENTITY_TYPE });
  const [entityPreviewKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_PREVIEW_ENTITY_TYPE });

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
    initialValues,
    entityType,
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

  const { getDataOptionsWithFetching } = useContext(RootContext);

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
      getDataOptionsWithFetching,
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

  const forcedVisibleValues = source?.map(el => {
    // take the value before the delimiter, we should show parent field value in the table
    // e.g. "field1[*]->subfieldA" => "field1"
    const [value] = el?.field.current?.split(REPEATABLE_FIELD_DELIMITER) || [];

    return value;
  });

  const getSaveBtnLabel = () => (saveBtnLabel || <FormattedMessage id="ui-plugin-query-builder.modal.run" />);
  // if getEntityTypeLabel is provided, use it to get the label, otherwise use entityType.labelAlias directly
  const entityTypeLabel = getEntityTypeLabel ? getEntityTypeLabel(entityType) : entityType?.labelAlias;

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
    <PaneFooter
      renderStart={(
        <Button
          onClick={handleCloseModal}
        >
          <FormattedMessage id="ui-plugin-query-builder.modal.cancel" />
        </Button>
      )}
      renderEnd={(
        <Button
          buttonStyle="primary"
          disabled={isRunQueryDisabled}
          onClick={handleRun}
        >
          {getSaveBtnLabel()}
        </Button>
      )}
    />
  );

  return (
    <Layer isOpen={isOpen} contentLabel={intl.formatMessage({ id: 'ui-plugin-query-builder.trigger' })}>
      <Pane
        dismissible
        paneSub={paneSub}
        paneTitle={<FormattedMessage id="ui-plugin-query-builder.trigger" />}
        footer={renderFooter()}
        onClose={handleCloseModal}
        defaultWidth="fill"
      >
        {isEntityTypeFetching ? (
          <Row center="xs">
            <Loading size="large" />
          </Row>
        ) : (
          <Layout className="display-flex flex-direction-column" style={{ minHeight: '100%' }}>
            <Headline size="medium" margin="small" tag="h3">
              <FormattedMessage id="ui-plugin-query-builder.modal.entityType" />
              {' '}
              <span className={css.regularFont}>{entityTypeLabel}</span>
            </Headline>
            <Headline size="medium" margin="none" tag="h3">
              <FormattedMessage id="ui-plugin-query-builder.modal.query" />
            </Headline>
            <div className={css.queryArea}>
              {queryStr}
            </div>

            <StripesOverlayWrapper>
              <RepeatableFields
                source={source}
                setSource={handleSetSource}
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
          </Layout>
        )}
      </Pane>
    </Layer>
  );
};

QueryBuilderModal.propTypes = queryBuilderModalPropTypes;
