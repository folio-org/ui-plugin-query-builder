import { PrevNextPagination } from '@folio/stripes-acq-components';
import {
  Accordion,
  Button,
  Col,
  Headline,
  Icon,
  Layout,
  MultiColumnList,
  Row,
} from '@folio/stripes/components';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useAsyncDataSource } from '../../hooks/useAsyncDataSource';
import { useLastNotEmptyValue } from '../../hooks/useLastNotEmptyValue';
import { usePagination } from '../../hooks/usePagination';
import { useViewerCallbacks } from '../../hooks/useViewerCallbacks';
import { useViewerRefresh } from '../../hooks/useViewerRefresh';
import { useQueryStr } from '../QueryBuilder/helpers/query';
import { QueryLoader } from './QueryLoader';

import css from './ResultViewer.css';

const AccordionHeaderLabel = ({ entityType, fqlQuery, headerRef }) => {
  const [showFull, setShowFull] = useState(false);
  const [{ queryTruncateWidth }, setTruncation] = useState({
    queryTruncateWidth: 0, // width to clip the query to, in px (0 if no clipping needed)
    headerWidthRequiringTruncation: 0, // width at which truncation was last needed, for resizing optimizations
  });

  const querySpanRef = useRef(null);

  const intl = useIntl();
  const queryStr = useQueryStr(entityType, { fqlQuery });

  const queryFormatted = useMemo(
    () => intl.formatMessage(
      {
        id: 'ui-plugin-query-builder.viewer.accordion.title.query',
      },
      {
        query: queryStr,
      },
    ),
    [intl, queryStr],
  );

  const buttonStr = useMemo(() => {
    if (showFull) {
      return intl.formatMessage({
        id: 'ui-plugin-query-builder.viewer.accordion.title.query.showLess',
      });
    } else {
      return intl.formatMessage({
        id: 'ui-plugin-query-builder.viewer.accordion.title.query.showMore',
      });
    }
  }, [intl, showFull]);

  // Warning to the reader: this is gross.
  //
  // However, with all the layers of DOM and flex within the accordion header,
  // we don't have much of another option, and that's before complicating things
  // with things like zoom levels, window font sizes, resilience against other
  // component changes, etc.
  useLayoutEffect(() => {
    function checkTruncation() {
      if (showFull === true) {
        // we can't check width if the text is wrapped and, to get to this
        // state, it must have already overflowed and the user clicked "show
        // more"
        return;
      }

      if (!headerRef.current || !querySpanRef.current) return;

      const iconWidth = headerRef.current.querySelector('svg')?.parentNode.parentNode.clientWidth ?? 0;
      const queryFontSize = parseFloat(window.getComputedStyle(querySpanRef.current).fontSize); // guaranteed to be px

      // These are the properties available to us in JS-land. They're not the
      // best, and include things like scrollbars/etc, but they're what we have.
      // We care about these values for the header as a whole, since it's tied
      // to the page width (using just our span will cause both widths to gladly
      // expand past the page boundaries)
      //
      // - offsetWidth is the visible width of the element, including padding
      //   and (sometimes) scrollbars
      // - scrollWidth is the full width of the content, regardless of visible
      //   area, but this gets weird too with children and whatnot
      const { offsetWidth, scrollWidth } = headerRef.current;

      setTruncation(
        ({
          queryTruncateWidth: currentTruncation,
          headerWidthRequiringTruncation: lastTruncateWidth,
        }) => {
          // no truncation needed in this case, as the query already fits
          // inside. 8px/0.5em buffer works for margin/etc between flex items,
          // and if we're a bit too early showing the button there's no harm
          // caused
          if (
            // we're bigger than last time we truncated, so we know we're fine.
            // without this, in overflow cases, we will end up un-truncating
            // (because our truncated form fits) and re-truncating repeatedly.
            offsetWidth > lastTruncateWidth &&
            scrollWidth - iconWidth <= offsetWidth - Math.min(8, queryFontSize / 2)
          ) {
            return { queryTruncateWidth: 0, headerWidthRequiringTruncation: lastTruncateWidth };
          }

          // 2px for a little extra wiggle room, just in case! We can't be too
          // conservative here, though, or the show more/less button will be too
          // far from the right side of the page
          const newTruncation = offsetWidth - iconWidth - 2;

          // truncating for the first time
          if (currentTruncation === 0) {
            return {
              queryTruncateWidth: newTruncation,
              headerWidthRequiringTruncation: offsetWidth,
            };
          }

          return {
            queryTruncateWidth: newTruncation,
            headerWidthRequiringTruncation: lastTruncateWidth,
          };
        },
      );
    }

    if (querySpanRef.current) {
      const observer = new ResizeObserver(checkTruncation);

      observer.observe(querySpanRef.current); // handle query string updates (values loading in, etc)
      window.addEventListener('resize', checkTruncation); // handle window resizes

      checkTruncation();

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', checkTruncation);
      };
    }

    return () => ({});
  }, [showFull, queryFormatted, headerRef.current, querySpanRef.current]);

  return (
    <div
      className={classNames(css.ResultViewerAccordionHeader, { [css.truncate]: !showFull })}
      style={queryTruncateWidth > 0 ? { '--truncate-to': `${queryTruncateWidth}px` } : {}}
    >
      <span ref={querySpanRef}>{queryFormatted}</span>

      {queryTruncateWidth > 0 && (
        <Button
          aria-label={buttonStr}
          buttonStyle="link"
          buttonClass={css.showMoreLessButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowFull((s) => !s);
          }}
        >
          {buttonStr}
        </Button>
      )}
    </div>
  );
};

export const ResultViewer = ({
  showPagination = true,
  defaultLimit = 100,
  pollingMode = false,
  autosize = false,
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
  const validVisibleColumns = visibleColumns.filter((column) => columnMapping[column]);
  const isListLoading =
    isContentDataFetching || isContentDataLoading || isEntityTypeLoading || refreshInProgress;

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

  const headerRef = useRef(null);

  const renderHeader = () => {
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
              {isListLoading && !totalRecords
                ? intl.formatMessage({ id: 'ui-plugin-query-builder.result.inProgress' })
                : headline?.({
                  totalRecords,
                  currentRecordsCount,
                  defaultLimit,
                  status,
                })}
            </Headline>
          </Col>
          {headlineEnd?.({
            currentRecordsCount,
            status,
          })}
        </Row>
      );
    };

    return isErrorOccurred ? renderErrorMessage() : renderSuccessMessage();
  };

  const emptyResultMessage = useMemo(() => {
    if (isErrorOccurred) {
      return intl.formatMessage({ id: 'ui-plugin-query-builder.error.occurredMessage' });
    } else {
      return intl.formatMessage({ id: 'ui-plugin-query-builder.result.emptyMessage' });
    }
  }, [isErrorOccurred, intl]);

  const renderTable = () => {
    const showSpinner =
      refreshInProgress ||
      (isEmpty(lastNotEmptyContent) &&
        (isListLoading || isContentDataLoading) &&
        isEmpty(contentData));

    return (
      <Row center="xs" className={css.ResultViewerRowWrapper}>
        <Col xs={12}>
          {showSpinner ? (
            <Icon icon="spinner-ellipsis" size="large" />
          ) : (
            <MultiColumnList
              id="results-viewer-table"
              data-testid="results-viewer-table"
              contentData={pollingMode ? lastNotEmptyContent : contentData}
              columnMapping={columnMapping}
              formatter={formatter}
              columnWidths={columnWidths}
              visibleColumns={validVisibleColumns}
              pagingType={null}
              onNeedMoreData={changePage}
              height={height}
              autosize={autosize}
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
  <Layout className="padding-bottom-gutter padding-top-gutter">{additionalControls}</Layout>
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
        <AccordionHeaderLabel entityType={entityType} fqlQuery={fqlQuery} headerRef={headerRef} />
      }
      headerProps={{ ref: headerRef }}
    >
      {renderContent()}
    </Accordion>
  );

  if (isPreviewLoading) return <QueryLoader />;

  return showQueryAccordion ? renderWithAccordion() : renderContent();
};

ResultViewer.propTypes = {
  showQueryAccordion: PropTypes.bool,
  fqlQuery: PropTypes.shape({
    query: PropTypes.string,
    params: PropTypes.objectOf(PropTypes.string),
  }),
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
  autosize: PropTypes.bool,
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
