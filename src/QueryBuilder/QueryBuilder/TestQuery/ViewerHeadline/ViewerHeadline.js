import React, { memo, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Loading } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import css from '../../../QueryBuilder.css';
import { QUERY_DETAILS_STATUSES } from '../../../../constants/query';

export const ViewerHeadline = memo(({ limit, total, isInProgress, status }) => {
  const intl = useIntl();
  const hasFailed = status === QUERY_DETAILS_STATUSES.FAILED;
  const isEmpty = total === 0;

  const title = useMemo(() => {
    if (hasFailed) {
      return <FormattedMessage id="ui-plugin-query-builder.error.occurredMessage" />;
    }

    const formattedTotal = intl.formatNumber(total);

    if (isEmpty) {
      return (
        <FormattedMessage
          id="ui-plugin-query-builder.modal.preview.title.empty"
          values={{ total, formattedTotal }}
        />
      );
    }

    const formattedLimit = intl.formatNumber(limit);

    return (
      <FormattedMessage
        id="ui-plugin-query-builder.modal.preview.title"
        values={{ total, limit, formattedTotal, formattedLimit }}
      />
    );
  }, [hasFailed, isEmpty, total, limit, intl]);

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
