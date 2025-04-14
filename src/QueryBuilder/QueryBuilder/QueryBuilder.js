import React, {
  useCallback,
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import { QueryBuilderModal } from './QueryBuilderModal';
import { queryBuilderModalPropTypes } from '../propTypes';

export const QueryBuilder = ({
  disabled,
  triggerButtonLabel,
  setIsModalShown: externalSetIsModalShown,
  ...modalProps
}) => {
  const [isModalShown, internalSetIsModalShown] = useState(false);

  const setIsModalShown = useCallback((isShown) => {
    externalSetIsModalShown?.(isShown);
    internalSetIsModalShown(isShown);
  }, [externalSetIsModalShown]);

  const openModal = useCallback(() => {
    setIsModalShown(true);
  }, [setIsModalShown]);

  return (
    <>
      <Button
        buttonStyle="primary"
        fullWidth
        onClick={openModal}
        disabled={disabled}
      >
        {triggerButtonLabel || <FormattedMessage id="ui-plugin-query-builder.trigger" />}
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
  triggerButtonLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  setIsModalShown: PropTypes.func,
  ...queryBuilderModalPropTypes,
};
