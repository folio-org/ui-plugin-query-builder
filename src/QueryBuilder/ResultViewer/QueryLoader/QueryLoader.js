import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Loading, Row, Headline } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';

export const QueryLoader = ({ title }) => {
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
          <Headline size="medium" margin="none" tag="span">
            {title}
          </Headline>
        </Icon>
      )}
    >
      <Row center="xs">
        <Loading size="large" />
      </Row>
      <Row>
        <Headline size="medium" weight="regular" margin="none" tag="span">
          <FormattedMessage id="ui-plugin-query-builder.viewer.retrieving" />
        </Headline>
      </Row>
    </Card>
  );
};

QueryLoader.propTypes = {
  title: PropTypes.string,
};
