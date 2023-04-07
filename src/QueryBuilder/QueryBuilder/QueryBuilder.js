import React, {
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import { QueryBuilderModal } from './QueryBuilderModal';

export const QueryBuilder = ({ disabled, initialValues }) => {
  const [isModalShown, setIsModalShown] = useState(false);

  const openModal = () => {
    setIsModalShown(true);
  };

  return (
    <>
      <Button
        buttonStyle="primary"
        fullWidth
        onClick={openModal}
        disabled={disabled}
      >
        <FormattedMessage id="ui-plugin-query-builder.trigger" />
      </Button>
      <QueryBuilderModal
        setIsModalShown={setIsModalShown}
        isOpen={isModalShown}
        initialValues={initialValues}
      />
    </>
  );
};

QueryBuilder.propTypes = {
  disabled: PropTypes.bool,
  initialValues: PropTypes.object,
};
