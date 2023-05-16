import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Col,
  Row,
} from '@folio/stripes/components';

import css from './QueryBuilderTitle.css';

export const QueryBuilderTitle = ({ results }) => {
  const isOperatorShown = results.some(result => Boolean(result.field.current));
  const isValueShown = results.some(result => Boolean(result.operator.current));

  return (
    <Row className={css.header}>
      {results.length > 1 && (
        <Col
          className={css.headerCell}
          sm={1}
        >
          <FormattedMessage id="ui-plugin-query-builder.columns.boolean" />
        </Col>
      )}
      <Col
        className={css.headerCell}
        sm={4}
      >
        <FormattedMessage id="ui-plugin-query-builder.columns.field" />
      </Col>
      {isOperatorShown && (
        <Col
          className={css.headerCell}
          sm={2}
        >
          <FormattedMessage id="ui-plugin-query-builder.columns.operator" />
        </Col>
      )}
      {isValueShown && (
        <Col
          className={css.headerCell}
          sm={4}
        >
          <FormattedMessage id="ui-plugin-query-builder.columns.value" />
        </Col>
      )}
      <Col
        className={css.headerCell}
        sm={1}
      >
        <FormattedMessage id="ui-plugin-query-builder.columns.action" />
      </Col>
    </Row>
  );
};

QueryBuilderTitle.propTypes = {
  results: PropTypes.arrayOf(PropTypes.object),
};
