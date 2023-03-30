import React, { useState } from 'react';
import { Button, Dropdown, DropdownMenu } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { CheckboxFilter } from '@folio/stripes/smart-components';
import PropTypes from 'prop-types';
import { ResultViewer } from '../../ResultViewer';
import { useTestQuery } from '../hooks/useTestQuery';

export const TestQuery = ({ isTestBtnDisabled, query, onTestQuery, onQueryRetrieved }) => {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [columns, setColumns] = useState([]);
  const { data, isFetched, isTestQueryFetching, testQuery } = useTestQuery();

  const handleTestQuery = () => {
    onTestQuery();
    testQuery();
  };
  const contentDataSource = async () => data?.content;
  const entityTypeDataSource = async () => data?.entityType;

  return (
    <>
      <Button disabled={isTestBtnDisabled || isTestQueryFetching} onClick={handleTestQuery}>
        <FormattedMessage id="ui-plugin-query-builder.modal.test" />
      </Button>

      {(isFetched || isTestQueryFetching) && (
        <ResultViewer
          contentDataSource={contentDataSource}
          entityTypeDataSource={entityTypeDataSource}
          visibleColumns={visibleColumns}
          onSetDefaultVisibleColumns={setVisibleColumns}
          onSetDefaultColumns={setColumns}
          inProgressTitle={`Query runned for ${query}`}
          isInProgress={isTestQueryFetching}
          showPagination={false}
          height={200}
          headlineEnd={(
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
          )}
          headline={({ totalRecords, defaultLimit }) => totalRecords && (
            <FormattedMessage
              id="ui-plugin-query-builder.modal.preview.title"
              values={{ total: totalRecords, limit: defaultLimit }}
            />
          )}
          onSuccess={onQueryRetrieved}
        />
      )}
    </>
  );
};

TestQuery.propTypes = {
  isTestBtnDisabled: PropTypes.bool,
  query: PropTypes.string,
  onQueryRetrieved: PropTypes.func,
  onTestQuery: PropTypes.func,
};
