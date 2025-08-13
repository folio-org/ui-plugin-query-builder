import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Accordion, MultiColumnList, Headline, Layout, Icon } from '@folio/stripes/components';
import { PrevNextPagination } from '@folio/stripes-acq-components';
import { FormattedMessage, useIntl } from 'react-intl';
import { isEmpty } from 'lodash';
import { QueryLoader } from './QueryLoader';
import { useAsyncDataSource } from '../../hooks/useAsyncDataSource';
import { usePagination } from '../../hooks/usePagination';
import { useViewerRefresh } from '../../hooks/useViewerRefresh';
import { useViewerCallbacks } from '../../hooks/useViewerCallbacks';
import { useLastNotEmptyValue } from '../../hooks/useLastNotEmptyValue';
import { useQueryStr } from '../QueryBuilder/helpers/query';

const AccordionHeaderLabel = ({ entityType, fqlQuery }) => (
  <FormattedMessage
    id="ui-plugin-query-builder.viewer.accordion.title.query"
    values={{ query: useQueryStr(entityType, { fqlQuery }) }}
  />
);

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
  showQueryAccordion,
  fqlQuery,
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
    entityType,
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
  // filter out columns that are not in the entity types mapping
  const validVisibleColumns = visibleColumns.filter(column => columnMapping[column]);
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
    visibleColumns: validVisibleColumns,
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
              visibleColumns={validVisibleColumns}
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
      label={
        <AccordionHeaderLabel
          entityType={entityType}
          fqlQuery={fqlQuery}
        />
      }
    >
      {renderContent()}
    </Accordion>
  );

  if (isPreviewLoading) return <QueryLoader />;

  return showQueryAccordion ? renderWithAccordion() : renderContent();
};

ResultViewer.propTypes = {
  showQueryAccordion: PropTypes.bool,
  fqlQuery: PropTypes.object,
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
  queryParams: PropTypes.objectOf(PropTypes.string),
  isPreviewLoading: PropTypes.bool,
  contentQueryOptions: PropTypes.shape({
    refetchInterval: PropTypes.func,
    completeExecution: PropTypes.func,
    keepPreviousData: PropTypes.bool,
  }),
  contentQueryKeys: PropTypes.arrayOf(PropTypes.string),
  additionalControls: PropTypes.element,
  refreshInProgress: PropTypes.bool,
  forcedVisibleValues: PropTypes.arrayOf(PropTypes.string),
};

AccordionHeaderLabel.propTypes = {
  entityType: ResultViewer.propTypes.entityType,
  fqlQuery: ResultViewer.propTypes.fqlQuery,
};
