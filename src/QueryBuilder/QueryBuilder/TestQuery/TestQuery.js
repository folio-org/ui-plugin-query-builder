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
  const [columns, setColumns] = useState([]);

  const { testQueryData, testQuery, isTestQueryLoading } = useTestQuery({
    testQueryDataSource,
    onQueryTestSuccess,
    onQueryTestFail,
  });

  const { queryId } = testQueryData || {};
  const refetchInterval = (query) => {
    const defaultInterval = 5000;
    const status = query?.status;

    if (status === QUERY_DETAILS_STATUSES.SUCCESS) {
      onQueryExecutionSuccess?.();
      setIsPreviewLoading(false);

      return 0;
    } else if (status === QUERY_DETAILS_STATUSES.FAILED) {
      onQueryExecutionFail?.();
      setIsPreviewLoading(false);

      return 0;
    } else {
      return defaultInterval;
    }
  };

  const structuralSharing = (oldData, newData) => {
    console.log('OLD DATA', oldData);
    console.log('NEW DATA', newData);
    console.log('---------------------------------------------------------------');

    if (oldData?.status && oldData?.content && !newData?.content) {
      return {
        ...newData,
        content: oldData.content,
      };
    }

    return newData;
  };

  const isTestQueryBtnDisabled = isTestQueryLoading || isQueryFilled || isPreviewLoading;

  const handleTestQuery = async () => {
    setIsPreviewLoading(true);

    await testQuery({
      entityTypeId,
      fqlQuery,
    });
  };

  const handleQueryRetrieved = (data) => {
    onQueryRetrieved(data);
  };

  const dropdown = (
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
          contentQueryOptions={{ refetchInterval, structuralSharing }}
          headline={renderHeadline}
          contentDataSource={queryDetailsDataSource}
          entityTypeDataSource={entityTypeDataSource}
          queryParams={{ queryId, includeContent: true }}
          visibleColumns={visibleColumns}
          onSetDefaultVisibleColumns={setVisibleColumns}
          onSetDefaultColumns={setColumns}
          showPagination={false}
          height={200}
          headlineEnd={dropdown}
          isPreviewLoading={isPreviewLoading}
          onPreviewShown={() => setIsPreviewLoading(false)}
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
