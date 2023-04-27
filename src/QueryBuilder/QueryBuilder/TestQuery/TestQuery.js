import React, { useState } from 'react';
import { Button, Dropdown, DropdownMenu, Loading } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { CheckboxFilter } from '@folio/stripes/smart-components';
import PropTypes from 'prop-types';
import { ResultViewer } from '../../ResultViewer';
import { useTestQuery } from '../hooks/useTestQuery';
import { QUERY_DETAILS_STATUSES } from '../constants/query';
import css from '../../QueryBuilder.css';

export const TestQuery = ({
  isQueryFilled,
  entityTypeDataSource,
  testQueryDataSource,
  queryDetailsDataSource,
  onQueryTestSuccess,
  onQueryTestFail,
  onQueryExecutionSuccess,
  onQueryExecutionFail,
  onQueryRetrieved,
  fqlQuery,
  entityTypeId,
}) => {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isTestQueryInProgress, setIsTestQueryInProgress] = useState(false);
  const [includeContent, setIncludeContent] = useState(true);
  const [columns, setColumns] = useState([]);

  const { testQueryData, testQuery, isTestQueryLoading } = useTestQuery({
    testQueryDataSource,
    onQueryTestSuccess,
    onQueryTestFail,
  });

  const { queryId } = testQueryData || {};
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
    setIncludeContent(true);
    setIsPreviewLoading(true);
    setIsTestQueryInProgress(true);

    await testQuery({
      entityTypeId,
      fqlQuery,
    }).catch(() => setIsPreviewLoading(false));
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

  const renderDropdown = ({ currentRecordsCount }) => !!currentRecordsCount && (
    <Dropdown
      label={<FormattedMessage id="ui-plugin-query-builder.control.dropdown.showColumns" />}
      mame="test-query-preview-dropdown"
    >
      <DropdownMenu
        role="menu"
        overrideStyle={{ maxHeight: 400 }}
      >
        <CheckboxFilter
          dataOptions={columns}
          selectedValues={visibleColumns}
          onChange={({ values }) => setVisibleColumns(values)}
          name="name"
        />
      </DropdownMenu>
    </Dropdown>
  );

  // eslint-disable-next-line react/prop-types
  const renderHeadline = ({ totalRecords: total = 0, currentRecordsCount = 0, defaultLimit, status }) => {
    const isInProgress = status === QUERY_DETAILS_STATUSES.IN_PROGRESS;
    const limit = currentRecordsCount < defaultLimit ? currentRecordsCount : defaultLimit;

    return (
      <>
        <FormattedMessage
          id="ui-plugin-query-builder.modal.preview.title"
          values={{
            total,
            limit,
          }}
        />
        {' '}
        {isInProgress && (
          <span className={css.AccordionHeaderLoading}>
            <FormattedMessage id="ui-plugin-query-builder.modal.preview.countingInProgress" />
            <Loading />
          </span>
        )}
      </>
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
          contentQueryOptions={{ refetchInterval, structuralSharing }}
          contentDataSource={queryDetailsDataSource}
          entityTypeDataSource={entityTypeDataSource}
          headline={renderHeadline}
          headlineEnd={renderDropdown}
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
  fqlQuery: PropTypes.object.isRequired,
  entityTypeDataSource: PropTypes.func.isRequired,
  testQueryDataSource: PropTypes.func.isRequired,
  queryDetailsDataSource: PropTypes.func.isRequired,
  entityTypeId: PropTypes.string,
  isQueryFilled: PropTypes.bool,
  onQueryRetrieved: PropTypes.func,
  onQueryTestSuccess: PropTypes.func,
  onQueryTestFail: PropTypes.func,
  onQueryExecutionSuccess: PropTypes.func,
  onQueryExecutionFail: PropTypes.func,
};
