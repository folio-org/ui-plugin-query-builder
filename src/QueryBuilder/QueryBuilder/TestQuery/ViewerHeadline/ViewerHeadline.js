import React, { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Loading } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import css from '../../../QueryBuilder.css';
import { QUERY_DETAILS_STATUSES } from '../../../../constants/query';

export const ViewerHeadline = memo(({ limit, total, isInProgress, status }) => {
  const hasFailed = status === QUERY_DETAILS_STATUSES.FAILED;
  const isEmpty = Number(total) === 0;

  return (
    <>
      {hasFailed ? (
        <FormattedMessage id="ui-plugin-query-builder.error.occurredMessage" />
      ) : isEmpty ? (
        <FormattedMessage id="ui-plugin-query-builder.modal.preview.title.empty" values={{ total }} />
      ) : (
        <FormattedMessage id="ui-plugin-query-builder.modal.preview.title" values={{ total, limit }} />
      )}
      {isInProgress && (
        <span className={css.AccordionHeaderLoading}>
          <FormattedMessage id="ui-plugin-query-builder.modal.preview.countingInProgress" />
          <Loading />
        </span>
      )}
    </>
  );
});

ViewerHeadline.propTypes = {
  limit: PropTypes.string,
  total: PropTypes.number,
  isInProgress: PropTypes.bool,
  status: PropTypes.string,
};
