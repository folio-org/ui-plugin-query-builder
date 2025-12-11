import React, { memo, useMemo } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Loading } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import css from '../../../QueryBuilder.css';
import { QUERY_DETAILS_STATUSES } from '../../../../constants/query';

export const ViewerHeadline = memo(({ limit, total, isInProgress, status }) => {
  const hasFailed = status === QUERY_DETAILS_STATUSES.FAILED;
  const isEmpty = total === 0;

  const title = useMemo(() => {
    if (hasFailed) {
      return <FormattedMessage id="ui-plugin-query-builder.error.occurredMessage" />;
    }

    const formattedTotal = <FormattedNumber value={total} />;

    if (isEmpty) {
      return <FormattedMessage id="ui-plugin-query-builder.modal.preview.title.empty" values={{ total: formattedTotal }} />;
    }

    return <FormattedMessage id="ui-plugin-query-builder.modal.preview.title" values={{ total: formattedTotal, limit }} />;
  }, [hasFailed, isEmpty, total, limit]);

  return (
    <>
      {title}
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
  limit: PropTypes.number,
  total: PropTypes.number,
  isInProgress: PropTypes.bool,
  status: PropTypes.string,
};
