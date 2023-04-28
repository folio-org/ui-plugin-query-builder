import React, { useState } from 'react';
import { Button } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';
import { ResultViewer } from '../../ResultViewer';
import { QUERY_DETAILS_STATUSES, QUERY_KEYS } from '../../../constants/query';
import { ViewerHeadline } from './ViewerHeadline/ViewerHeadline';
import { ColumnsDropdown } from './ColumnsDropdown/ColumnsDropdown';

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
  fqlQuery,
  entityTypeId,
  isPreviewLoading,
  setIsPreviewLoading,
  isTestQueryInProgress,
  setIsTestQueryInProgress,
}) => {
  const queryClient = useQueryClient();

  const [columns, setColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [includeContent, setIncludeContent] = useState(true);

  const isTestQueryBtnDisabled = isTestQueryLoading || !isQueryFilled || isTestQueryInProgress;

  const refetchInterval = (query) => {
    const defaultInterval = 5000;
    const status = query?.status;

    const completeExecution = () => {
      setIsPreviewLoading(false);
      setIsTestQueryInProgress(false);

      return 0;
    };

    if (status === QUERY_DETAILS_STATUSES.SUCCESS) {
      onQueryExecutionSuccess?.();

      return completeExecution();
    } else if (status === QUERY_DETAILS_STATUSES.FAILED) {
      onQueryExecutionFail?.();

      return completeExecution();
    } else {
      return defaultInterval;
    }
  };

  const structuralSharing = (oldData, newData) => {
    if (oldData?.status && oldData?.content && !newData?.content) {
      return {
        ...newData,
        content: oldData.content,
      };
    }

    return newData;
  };

  const handleTestQuery = async () => {
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.QUERY_PLUGIN_CONTENT_DATA] });

    setIncludeContent(true);
    setIsPreviewLoading(true);
    setIsTestQueryInProgress(true);

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

  const handleColumnChange = ({ values }) => setVisibleColumns(values);

  const renderDropdown = ({ currentRecordsCount }) => !!currentRecordsCount && (
    <ColumnsDropdown
      columns={columns}
      visibleColumns={visibleColumns}
      onColumnChange={handleColumnChange}
    />
  );

  // eslint-disable-next-line react/prop-types
  const renderHeadline = ({ totalRecords: total = 0, currentRecordsCount = 0, defaultLimit, status }) => {
    const isInProgress = status === QUERY_DETAILS_STATUSES.IN_PROGRESS;
    const limit = currentRecordsCount < defaultLimit ? currentRecordsCount : defaultLimit;

    return (
      <ViewerHeadline
        total={total}
        limit={limit}
        isInProgress={isInProgress}
      />
    );
  };

  return (
    <>
      <Button disabled={isTestQueryBtnDisabled} onClick={handleTestQuery}>
        <FormattedMessage id="ui-plugin-query-builder.modal.test" />
      </Button>

      {queryId && (
        <ResultViewer
          onSuccess={handleQueryRetrieved}
          onPreviewShown={handlePreviewShown}
          onSetDefaultColumns={setColumns}
          onSetDefaultVisibleColumns={setVisibleColumns}
          contentDataSource={queryDetailsDataSource}
          entityTypeDataSource={entityTypeDataSource}
          headline={renderHeadline}
          headlineEnd={renderDropdown}
          contentQueryOptions={{
            refetchInterval,
            structuralSharing,
            keepPreviousData: false,
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
  queryId: PropTypes.object,
  fqlQuery: PropTypes.object,
  entityTypeDataSource: PropTypes.func,
  queryDetailsDataSource: PropTypes.func,
  entityTypeId: PropTypes.string,
  isQueryFilled: PropTypes.bool,
  onQueryRetrieved: PropTypes.func,
  onQueryExecutionSuccess: PropTypes.func,
  onQueryExecutionFail: PropTypes.func,
  testQuery: PropTypes.func,
  isTestQueryLoading: PropTypes.bool,
  isPreviewLoading: PropTypes.bool,
  setIsPreviewLoading: PropTypes.func,
  isTestQueryInProgress: PropTypes.bool,
  setIsTestQueryInProgress: PropTypes.func,
};
