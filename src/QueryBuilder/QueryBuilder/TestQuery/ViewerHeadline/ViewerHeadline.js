import React, { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Loading } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import css from '../../../QueryBuilder.css';

export const ViewerHeadline = memo(({ limit, total, isInProgress }) => {
  return (
    <>
      {Number(total) === 0 ? (
        <FormattedMessage
          id="ui-plugin-query-builder.modal.preview.title.empty"
          values={{ total }}
        />
      ) : (
        <FormattedMessage
          id="ui-plugin-query-builder.modal.preview.title"
          values={{
            total,
            limit,
          }}
        />
      )}{' '}
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
};
