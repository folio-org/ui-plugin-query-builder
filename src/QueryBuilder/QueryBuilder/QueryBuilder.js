import React, {
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import { QueryBuilderModal } from './QueryBuilderModal';
import { queryBuilderModalPropTypes } from '../propTypes';

export const QueryBuilder = ({
  disabled,
  ...modalProps
}) => {
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
        isOpen={isModalShown}
        setIsModalShown={setIsModalShown}
        {...modalProps}
      />
    </>
  );
};

QueryBuilder.propTypes = {
  disabled: PropTypes.bool,
  ...queryBuilderModalPropTypes,
};
