import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Accordion, MultiColumnList, Headline } from '@folio/stripes/components';
import { PrevNextPagination } from '@folio/stripes-acq-components';
import { QueryLoader } from './QueryLoader';
import { useAsyncDataSource } from '../../hooks/useAsyncDataSource';
import { usePagination } from '../../hooks/usePagination';

export const ResultViewer = ({
  showPagination = true,
  defaultLimit = 100,
  defaultOffset = 0,
  queryParams = {},
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
  refetchInterval,
}) => {
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
    refetchInterval,
    queryParams,
  });

  const recordsCount = contentData?.length || 0;

  // set visible by default columns once
  useEffect(() => {
    if (isContentTypeFetchedAfterMount) {
      onSetDefaultColumns?.(defaultColumns);
      onSetDefaultVisibleColumns?.(defaultVisibleColumns);
    }
  }, [isContentTypeFetchedAfterMount]);

  // refresh functionality
  useEffect(() => {
    if (refreshTrigger) {
      if (offset === defaultOffset) {
        refetch();
      } else {
        changePage({ offset: defaultOffset, limit: defaultLimit });
      }
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (recordsCount >= limit) onPreviewShown?.();
  }, [recordsCount]);

  const renderHeader = () => (
    <Row between="xs">
      <Col xs={10}>
        <Headline size="large" margin="none" tag="h3">
          {headline({ totalRecords, defaultLimit, status })}
        </Headline>
      </Col>
      {headlineEnd}
    </Row>
  );

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
            loading={isContentDataFetching || isContentDataLoading || isEntityTypeLoading}
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

  const renderContent = () => {
    return (
      <>
        {renderHeader()}
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

  if (recordsCount < limit) return <QueryLoader />;

  return accordionHeadline ? renderWithAccordion() : renderContent();
};
ResultViewer.propTypes = {
  accordionHeadline: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),
  headline: PropTypes.func,
  headlineEnd: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
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
  refetchInterval: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
};
