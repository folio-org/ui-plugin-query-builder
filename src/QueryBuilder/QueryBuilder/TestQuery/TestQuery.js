import React, { useState } from 'react';
import { Button, Dropdown, DropdownMenu } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { CheckboxFilter } from '@folio/stripes/smart-components';
import PropTypes from 'prop-types';
import { ResultViewer } from '../../ResultViewer';
import { useTestQuery } from '../hooks/useTestQuery';
import { QUERY_DETAILS_STATUSES } from '../constants/query';

export const TestQuery = ({
  isQueryFilled,
  entityTypeDataSource,
  testQueryDataSource,
  queryDetailsDataSource,
  onQueryTestSuccess,
  onQueryTestFail,
  onQueryRetrieved,
  fqlQuery,
}) => {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [queryDetails, setQueryDetails] = useState();
  const [includeContent, setIncludeContent] = useState(true);
  const [columns, setColumns] = useState([]);

  const { testQueryData, testQuery, isTestQueryLoading } = useTestQuery({
    testQueryDataSource,
    onQueryTestSuccess,
    onQueryTestFail,
  });

  const { queryId } = testQueryData || {};
  const isQueryCompleted = (query) => {
    const status = query?.status;

    if ([QUERY_DETAILS_STATUSES.SUCCESS, QUERY_DETAILS_STATUSES.FAILED].includes(status)) {
      return false;
    }

    return 5000;
  };

  const isQueryInProgress = queryDetails?.status === QUERY_DETAILS_STATUSES.IN_PROGRESS;
  const isTestQueryBtnDisabled = isTestQueryLoading || isQueryFilled || isQueryInProgress;

  const handleTestQuery = async () => {
    setIncludeContent(true);

    await testQuery({
      queryId,
      fqlQuery,
    });
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

  const renderHeadline = ({ totalRecords, defaultLimit: limit, status }) => {
    const isInProgress = status === QUERY_DETAILS_STATUSES.IN_PROGRESS;
    const total = (
      <>
        {totalRecords}
        {isInProgress && <FormattedMessage id="ui-plugin-query-builder.modal.preview.countingInProgress" />}
      </>
    );

    return totalRecords && (
      <FormattedMessage
        id="ui-plugin-query-builder.modal.preview.title"
        values={{
          total,
          limit,
        }}
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
          contentDataSource={queryDetailsDataSource}
          queryParams={{ queryId, includeContent }}
          onSuccess={(data) => {
            setQueryDetails(data);
            onQueryRetrieved(data);
          }}
          onPreviewShown={() => setIncludeContent(false)}
          entityTypeDataSource={entityTypeDataSource}
          visibleColumns={visibleColumns}
          onSetDefaultVisibleColumns={setVisibleColumns}
          onSetDefaultColumns={setColumns}
          showPagination={false}
          height={200}
          headlineEnd={dropdown}
          headline={renderHeadline}
          refetchInterval={isQueryCompleted}
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
  isQueryFilled: PropTypes.bool,
  onQueryRetrieved: PropTypes.func,
  onQueryTestSuccess: PropTypes.func,
  onQueryTestFail: PropTypes.func,
};
