import React from 'react';
import { Card, Icon, Loading, Row, Headline } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';

import css from '../../QueryBuilder.css';

export const QueryLoader = () => {
  return (
    <Card
      id="my-card"
      cardStyle="positive"
      roundedBorder
      headerStart={(
        <Icon
          icon="edit"
          iconPosition="start"
        >
          <Headline size="medium" margin="none" tag="p" className={css.LoaderTitle}>
            <FormattedMessage id="ui-plugin-query-builder.modal.preview.queryInProgress" />
          </Headline>
        </Icon>
      )}
    >
      <Row center="xs">
        <Loading size="large" />
      </Row>
      <Row>
        <Headline size="medium" weight="regular" margin="none" tag="div">
          <FormattedMessage id="ui-plugin-query-builder.viewer.retrieving" />
        </Headline>
      </Row>
    </Card>
  );
};
