import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Accordion, MultiColumnList, Headline, Layout, Icon } from '@folio/stripes/components';
import { PrevNextPagination } from '@folio/stripes-acq-components';
import { useIntl } from 'react-intl';
import { isEmpty } from 'lodash';
import { QueryLoader } from './QueryLoader';
import { useAsyncDataSource } from '../../hooks/useAsyncDataSource';
import { usePagination } from '../../hooks/usePagination';
import { useViewerRefresh } from '../../hooks/useViewerRefresh';
import { useViewerCallbacks } from '../../hooks/useViewerCallbacks';
import { useLastNotEmptyValue } from '../../hooks/useLastNotEmptyValue';

export const ResultViewer = ({
  showPagination = true,
  defaultLimit = 100,
  pollingMode = false,
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
  refreshInProgress,
  forcedVisibleValues,
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
    columnMapping,
    defaultColumns,
    defaultVisibleColumns,
    refetch,
    status,
    formatter,
    columnWidths,
    isErrorOccurred,
  } = useAsyncDataSource({
    entityTypeDataSource,
    contentDataSource,
    offset,
    limit,
    onSuccess,
    queryParams,
    contentQueryOptions,
    contentQueryKeys,
    forcedVisibleValues,
  });
  const lastNotEmptyContent = useLastNotEmptyValue(contentData, []);
  const currentRecordsCount = useLastNotEmptyValue(contentData?.length, 0);

  const isListLoading = isContentDataFetching || isContentDataLoading || isEntityTypeLoading || refreshInProgress;

  useViewerCallbacks({
    onSetDefaultColumns,
    defaultColumns,
    onSetDefaultVisibleColumns,
    defaultVisibleColumns,
    currentRecordsCount,
    onPreviewShown,
    defaultLimit,
    forcedVisibleValues,
    visibleColumns,
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

    const renderErrorMessage = () => {
      return (
        <Row between="xs">
          <Col xs={10}>
            <Headline size="large" margin="none" tag="h3">
              {intl.formatMessage({ id: 'ui-plugin-query-builder.error.occurredMessage' })}
            </Headline>
          </Col>
        </Row>
      );
    };

    const renderSuccessMessage = () => {
      return (
        <Row between="xs">
          <Col xs={10}>
            <Headline size="large" margin="none" tag="h3">
              {isListLoading && !totalRecords ?
                intl.formatMessage({ id: 'ui-plugin-query-builder.result.inProgress' })
                :
                headline?.({
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

    return isErrorOccurred ? renderErrorMessage() : renderSuccessMessage();
  };

  const emptyResultMessage = intl.formatMessage(
    { id: 'ui-plugin-query-builder.result.emptyMessage' },
  );

  const renderTable = () => {
    const showSpinner =
        refreshInProgress
        ||
        (isEmpty(lastNotEmptyContent) && (isListLoading || isContentDataLoading) && isEmpty(contentData));

    return (
      <Row center="xs">
        <Col xs={12}>
          {showSpinner ? (
            <Icon
              icon="spinner-ellipsis"
              size="large"
            />
          ) : (
            <MultiColumnList
              data-testid="results-viewer-table"
              contentData={pollingMode ? lastNotEmptyContent : contentData}
              columnMapping={columnMapping}
              formatter={formatter}
              columnWidths={columnWidths}
              visibleColumns={visibleColumns}
              pagingType={null}
              onNeedMoreData={changePage}
              height={height}
              loading={isListLoading}
              isEmptyMessage={emptyResultMessage}
            />
          )}
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
        {!isEmpty(columnMapping) && renderTable()}
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
  pollingMode: PropTypes.bool,
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
  refreshInProgress: PropTypes.bool,
  forcedVisibleValues: PropTypes.arrayOf(PropTypes.string),
};
