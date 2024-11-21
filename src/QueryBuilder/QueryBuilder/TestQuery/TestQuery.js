import React, { useState } from 'react';

import { Button, MessageBanner, Layout } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { useQueryClient } from 'react-query';
import { useNamespace } from '@folio/stripes/core';
import { ResultViewer } from '../../ResultViewer';
import { QUERY_DETAILS_STATUSES, QUERY_KEYS } from '../../../constants/query';
import { ViewerHeadline } from './ViewerHeadline/ViewerHeadline';
import { ColumnsDropdown } from './ColumnsDropdown/ColumnsDropdown';
import { DEFAULT_PREVIEW_INTERVAL } from '../helpers/query';

export const TestQuery = ({
  queryId,
  testQuery,
  isTestQueryLoading,
  isQueryFilled,
  entityTypeDataSource,
  queryDetailsDataSource,
  onQueryExecutionSuccess,
  onQueryExecutionFail,
  onQueryRetrieved,
  recordColumns = [],
  onSetDefaultVisibleColumns = () => {},
  fqlQuery,
  entityTypeId,
  isPreviewLoading,
  setIsPreviewLoading,
  isTestQueryInProgress,
  setIsTestQueryInProgress,
  recordsLimitExceeded,
  setRecordsLimitExceeded,
  recordsLimit,
  forcedVisibleValues,
}) => {
  const queryClient = useQueryClient();
  const [contentDataKey] = useNamespace({ key: QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA });
  const [columns, setColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(recordColumns);

  const [includeContent, setIncludeContent] = useState(true);

  const isTestQueryBtnDisabled = isTestQueryLoading || !isQueryFilled || isTestQueryInProgress;

  const completeExecution = () => {
    setIsPreviewLoading(false);
    setIsTestQueryInProgress(false);

    return 0;
  };

  const refetchInterval = (query) => {
    const status = query?.status;
    const totalRecords = query?.totalRecords || 0;

    if (recordsLimit && totalRecords > recordsLimit) {
      setRecordsLimitExceeded(true);

      return completeExecution();
    } else if (status === QUERY_DETAILS_STATUSES.SUCCESS) {
      onQueryExecutionSuccess?.();

      return completeExecution();
    } else if (status === QUERY_DETAILS_STATUSES.FAILED) {
      onQueryExecutionFail?.();

      return completeExecution();
    } else {
      return DEFAULT_PREVIEW_INTERVAL;
    }
  };

  const handleTestQuery = async () => {
    queryClient.removeQueries({ queryKey: [contentDataKey] });

    setIncludeContent(true);
    setIsPreviewLoading(true);
    setIsTestQueryInProgress(true);
    setRecordsLimitExceeded(false);

    try {
      await testQuery({
        entityTypeId,
        fqlQuery,
      });
    } catch {
      setIsPreviewLoading(false);
    }
  };

  const handleQueryRetrieved = (data) => {
    onQueryRetrieved(data);
  };

  const handlePreviewShown = ({ currentRecordsCount, defaultLimit }) => {
    if (currentRecordsCount >= defaultLimit) {
      setIncludeContent(false);
    }

    setIsPreviewLoading(false);
  };

  const handleColumnChange = ({ values }) => {
    onSetDefaultVisibleColumns(values);

    return setVisibleColumns(values);
  };

  const handleDefaultVisibleColumnsChange = (values) => {
    setVisibleColumns(values);
    onSetDefaultVisibleColumns(values);
  };

  const renderDropdown = ({ currentRecordsCount }) => !!Number(currentRecordsCount) && (
    <ColumnsDropdown
      columns={columns}
      visibleColumns={visibleColumns}
      onColumnChange={handleColumnChange}
    />
  );

  const renderHeadline = ({ totalRecords: total = '0', currentRecordsCount = '0', defaultLimit, status }) => {
    const isInProgress = status === QUERY_DETAILS_STATUSES.IN_PROGRESS && !recordsLimitExceeded;
    const limit = currentRecordsCount < defaultLimit ? currentRecordsCount : defaultLimit;

    return (
      <ViewerHeadline
        total={total}
        limit={limit}
        isInProgress={isInProgress}
      />
    );
  };

  const renderMessageBanner = () => recordsLimitExceeded && (
    <Layout className="padding-bottom-gutter">
      <MessageBanner type="warning">
        <FormattedMessage id="ui-plugin-query-builder.modal.banner.limit" />
      </MessageBanner>
    </Layout>
  );

  const renderTestButton = () => (
    <Button disabled={isTestQueryBtnDisabled} onClick={handleTestQuery}>
      <FormattedMessage id="ui-plugin-query-builder.modal.test" />
    </Button>
  );

  return (
    <>
      {renderTestButton()}

      {renderMessageBanner()}

      {queryId && (
        <ResultViewer
          poolingMode
          onSuccess={handleQueryRetrieved}
          onPreviewShown={handlePreviewShown}
          forcedVisibleValues={forcedVisibleValues}
          onSetDefaultColumns={setColumns}
          onSetDefaultVisibleColumns={handleDefaultVisibleColumnsChange}
          contentDataSource={queryDetailsDataSource}
          entityTypeDataSource={entityTypeDataSource}
          headline={renderHeadline}
          headlineEnd={renderDropdown}
          contentQueryOptions={{
            refetchInterval,
            keepPreviousData: false,
            completeExecution
          }}
          contentQueryKeys={[queryId]}
          queryParams={{ queryId, includeContent }}
          visibleColumns={visibleColumns}
          showPagination={false}
          height={200}
          isPreviewLoading={isPreviewLoading}
        />
      )}
    </>
  );
};

TestQuery.propTypes = {
  queryId: PropTypes.string,
  fqlQuery: PropTypes.object,
  entityTypeDataSource: PropTypes.func,
  queryDetailsDataSource: PropTypes.func,
  entityTypeId: PropTypes.string,
  isQueryFilled: PropTypes.bool,
  onQueryRetrieved: PropTypes.func,
  onQueryExecutionSuccess: PropTypes.func,
  onQueryExecutionFail: PropTypes.func,
  onSetDefaultVisibleColumns: PropTypes.func,
  testQuery: PropTypes.func,
  isTestQueryLoading: PropTypes.bool,
  isPreviewLoading: PropTypes.bool,
  setIsPreviewLoading: PropTypes.func,
  isTestQueryInProgress: PropTypes.bool,
  setIsTestQueryInProgress: PropTypes.func,
  recordsLimitExceeded: PropTypes.bool,
  setRecordsLimitExceeded: PropTypes.func,
  recordsLimit: PropTypes.number,
  recordColumns: PropTypes.arrayOf(PropTypes.string),
  forcedVisibleValues: PropTypes.arrayOf(PropTypes.string),
};
