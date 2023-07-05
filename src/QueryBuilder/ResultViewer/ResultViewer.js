import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Accordion, MultiColumnList, Headline, Layout } from '@folio/stripes/components';
import { PrevNextPagination } from '@folio/stripes-acq-components';
import { useIntl } from 'react-intl';
import { QueryLoader } from './QueryLoader';
import { useAsyncDataSource } from '../../hooks/useAsyncDataSource';
import { usePagination } from '../../hooks/usePagination';
import { useViewerRefresh } from '../../hooks/useViewerRefresh';
import { useViewerCallbacks } from '../../hooks/useViewerCallbacks';

export const ResultViewer = ({
  showPagination = true,
  defaultLimit = 100,
  defaultOffset = 0,
  queryParams = {},
  contentQueryOptions = {},
  contentQueryKeys = [],
  contentDataSource,
  entityTypeDataSource,
  headline,
  headlineEnd,
  visibleColumns,
  onSetDefaultVisibleColumns,
  onSetDefaultColumns,
  accordionHeadline,
  height,
  refreshTrigger,
  onSuccess,
  onPreviewShown,
  isPreviewLoading,
  additionalControls,
}) => {
  const intl = useIntl();

  const { changePage, limit, offset } = usePagination({
    defaultLimit,
    defaultOffset,
  });

  const {
    contentData,
    totalRecords,
    isContentDataLoading,
    isContentDataFetching,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
    refetch,
    status,
  } = useAsyncDataSource({
    entityTypeDataSource,
    contentDataSource,
    offset,
    limit,
    onSuccess,
    queryParams,
    contentQueryOptions,
    contentQueryKeys,
  });

  const isListLoading = isContentDataFetching || isContentDataLoading || isEntityTypeLoading;
  const currentRecordsCount = contentData?.length || 0;

  // set visible by default columns once
  useViewerCallbacks({
    isContentTypeFetchedAfterMount,
    onSetDefaultColumns,
    defaultColumns,
    onSetDefaultVisibleColumns,
    defaultVisibleColumns,
    currentRecordsCount,
    onPreviewShown,
    defaultLimit,
  });

  // refresh functionality
  useViewerRefresh({
    refetch,
    refreshTrigger,
    changePage,
    defaultLimit,
    defaultOffset,
    offset,
  });

  const renderHeader = () => {
    const localizedTotalRecords = intl.formatNumber(totalRecords);
    const localizedCurrentRecordsCount = intl.formatNumber(currentRecordsCount);

    return (
      <Row between="xs">
        <Col xs={10}>
          <Headline size="large" margin="none" tag="h3">
            {headline?.({
              totalRecords: localizedTotalRecords,
              currentRecordsCount: localizedCurrentRecordsCount,
              defaultLimit,
              status,
            })}
          </Headline>
        </Col>
        {headlineEnd?.({
          currentRecordsCount: localizedCurrentRecordsCount,
          status,
        })}
      </Row>
    );
  };

  const renderTable = () => {
    return (
      <Row center="xs">
        <Col xs={12}>
          <MultiColumnList
            data-testid="results-viewer-table"
            contentData={contentData}
            columnMapping={columnMapping}
            visibleColumns={visibleColumns}
            pagingType={null}
            onNeedMoreData={changePage}
            height={height}
            loading={isListLoading}
          />
          {showPagination && (
            <PrevNextPagination
              limit={limit}
              offset={offset}
              totalCount={totalRecords}
              onChange={changePage}
            />
          )}
        </Col>
      </Row>
    );
  };

  const renderAdditionalControls = () => additionalControls && (
    <Layout className="padding-bottom-gutter padding-top-gutter">
      {additionalControls}
    </Layout>
  );

  const renderContent = () => {
    return (
      <>
        {renderHeader()}
        {renderAdditionalControls()}
        {renderTable()}
      </>
    );
  };

  const renderWithAccordion = () => (
    <Accordion
      id="results-viewer-accordion"
      label={accordionHeadline}
    >
      {renderContent()}
    </Accordion>
  );

  if (isPreviewLoading) return <QueryLoader />;

  return accordionHeadline ? renderWithAccordion() : renderContent();
};
ResultViewer.propTypes = {
  accordionHeadline: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),
  headline: PropTypes.func,
  headlineEnd: PropTypes.func,
  contentDataSource: PropTypes.func,
  entityTypeDataSource: PropTypes.func,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  onSetDefaultVisibleColumns: PropTypes.func,
  onSetDefaultColumns: PropTypes.func,
  defaultLimit: PropTypes.number,
  defaultOffset: PropTypes.number,
  height: PropTypes.number,
  showPagination: PropTypes.bool,
  refreshTrigger: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  onSuccess: PropTypes.func,
  onPreviewShown: PropTypes.func,
  queryParams: PropTypes.object,
  isPreviewLoading: PropTypes.bool,
  contentQueryOptions: PropTypes.object,
  contentQueryKeys: PropTypes.arrayOf(PropTypes.string),
  additionalControls: PropTypes.element,
};
