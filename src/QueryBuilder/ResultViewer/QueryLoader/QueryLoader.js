import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Loading, Row, Headline } from '@folio/stripes/components';

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
    </Card>
  );
};

QueryLoader.propTypes = {
  title: PropTypes.string,
};
