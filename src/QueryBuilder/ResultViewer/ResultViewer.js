import React, { memo, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Accordion, AccordionSet, MultiColumnList, Headline } from '@folio/stripes/components';
import { PrevNextPagination, usePagination } from '@folio/stripes-acq-components';
import { QueryLoader } from './QueryLoader';
import { getTableMetadata } from './helpers';

export const ResultViewer = memo(({
  showPagination = true,
  contentData = [],
  limit = 100,
  offset = 0,
  onPageChange,
  entityType,
  headline,
  headlineEnd,
  visibleColumns,
  onSetDefaultVisibleColumns,
  onSetDefaultColumns,
  accordionHeadline,
  isInProgress,
  inProgressTitle,
  height,
  mlcLoading,
}) => {
  const { changePage, pagination } = usePagination({ limit, offset });
  const {
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
  } = useMemo(() => getTableMetadata(entityType), [entityType]);

  useEffect(() => {
    onPageChange?.(pagination);
  }, [pagination]);

  // set visible by default columns once
  useEffect(() => {
    if (defaultVisibleColumns && defaultColumns) {
      onSetDefaultColumns?.(defaultColumns);
      onSetDefaultVisibleColumns?.(defaultVisibleColumns);
    }
  }, [defaultVisibleColumns, defaultColumns]);

  const renderTable = () => (
    <>
      <Row between="xs">
        <Col xs={6}>
          <Headline size="large" margin="none" tag="h3">
            {headline}
          </Headline>
        </Col>
        {headlineEnd}
      </Row>
      <Row>
        <Col xs={12}>
          <MultiColumnList
            contentData={contentData}
            columnMapping={columnMapping}
            visibleColumns={visibleColumns}
            pagingType={null}
            onNeedMoreData={changePage}
            height={height}
            loading={mlcLoading}
          />
          {showPagination && (
            <PrevNextPagination
              {...pagination}
              totalCount={contentData?.length}
              onChange={changePage}
            />
          )}
        </Col>
      </Row>
    </>
  );

  const renderWithAccordion = () => (
    <AccordionSet>
      <Accordion
        id="accordion-id"
        label={accordionHeadline}
      >
        {renderTable()}
      </Accordion>
    </AccordionSet>
  );

  if (isInProgress) return <QueryLoader title={inProgressTitle} />;

  return accordionHeadline ? renderWithAccordion() : renderTable();
});

ResultViewer.propTypes = {
  accordionHeadline: PropTypes.string,
  headline: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  headlineEnd: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  contentData: PropTypes.arrayOf(PropTypes.object),
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
  limit: PropTypes.number,
  offset: PropTypes.number,
  onPageChange: PropTypes.func,
  isInProgress: PropTypes.bool,
  inProgressTitle: PropTypes.string,
  height: PropTypes.number,
  showPagination: PropTypes.bool,
  mlcLoading: PropTypes.bool,
};
