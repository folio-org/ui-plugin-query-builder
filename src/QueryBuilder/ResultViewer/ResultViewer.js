import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Accordion, MultiColumnList, Headline, Loading } from '@folio/stripes/components';
import { PrevNextPagination } from '@folio/stripes-acq-components';
import { QueryLoader } from './QueryLoader';
import { useAsyncDataSource } from '../../hooks/useAsyncDataSource';
import { usePagination } from '../../hooks/usePagination';

export const ResultViewer = ({
  showPagination = true,
  defaultLimit = 100,
  defaultOffset = 0,
  contentDataSource,
  entityTypeDataSource,
  headline,
  headlineEnd,
  visibleColumns,
  onSetDefaultVisibleColumns,
  onSetDefaultColumns,
  accordionHeadline,
  isInProgress,
  inProgressTitle,
  height,
}) => {
  const { changePage, limit, offset } = usePagination({
    defaultLimit,
    defaultOffset,
  });

  const {
    contentData,
    totalElements,
    pageSize,
    isContentDataLoading,
    isContentDataFetching,
    isEntityTypeLoading,
    isContentTypeFetchedAfterMount,
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
  } = useAsyncDataSource({
    entityTypeDataSource,
    contentDataSource,
    offset,
    limit,
  });

  // set visible by default columns once
  useEffect(() => {
    if (isContentTypeFetchedAfterMount) {
      onSetDefaultColumns?.(defaultColumns);
      onSetDefaultVisibleColumns?.(defaultVisibleColumns);
    }
  }, [isContentTypeFetchedAfterMount]);

  const renderHeader = () => (
    <Row between="xs">
      <Col xs={6}>
        <Headline size="large" margin="none" tag="h3">
          {headline({ totalElements, pageSize })}
        </Headline>
      </Col>
      {headlineEnd}
    </Row>
  );

  const renderTable = () => (
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
          loading={isContentDataFetching}
        />
        {showPagination && (
          <PrevNextPagination
            limit={limit}
            offset={offset}
            totalCount={totalElements}
            onChange={changePage}
          />
        )}
      </Col>
    </Row>
  );

  const renderContent = () => {
    if (isContentDataLoading || isEntityTypeLoading) {
      return (
        <Row center="xs">
          <Loading size="large" />
        </Row>
      );
    }

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
      data-testid="results-viewer-accordion"
      label={accordionHeadline}
    >
      {renderContent()}
    </Accordion>
  );

  if (isInProgress) return <QueryLoader title={inProgressTitle} />;

  return accordionHeadline ? renderWithAccordion() : renderContent();
};
ResultViewer.propTypes = {
  accordionHeadline: PropTypes.string,
  headline: PropTypes.func,
  headlineEnd: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  contentData: PropTypes.shape({
    content: PropTypes.arrayOf(PropTypes.object),
    pageable: PropTypes.object,
    totalPages: PropTypes.number,
    totalElements: PropTypes.number,
    last: PropTypes.bool,
    size: PropTypes.number,
    number: PropTypes.number,
    sort: PropTypes.object,
    numberOfElements: PropTypes.number,
    first: PropTypes.bool,
    empty: PropTypes.bool,
  }),
  entityType: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    labelAlias: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      dataType: PropTypes.shape({
        dataType: PropTypes.string,
      }),
      labelAlias: PropTypes.string,
      visibleByDefault: PropTypes.bool,
    })),
  }),
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  onSetDefaultVisibleColumns: PropTypes.func,
  onSetDefaultColumns: PropTypes.func,
  defaultLimit: PropTypes.number,
  defaultOffset: PropTypes.number,
  isInProgress: PropTypes.bool,
  inProgressTitle: PropTypes.string,
  height: PropTypes.number,
  showPagination: PropTypes.bool,
};
