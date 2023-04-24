import React, {
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@folio/stripes/components';
import PropTypes from 'prop-types';
import { QueryBuilderModal } from './QueryBuilderModal';

export const QueryBuilder = ({
  disabled,
  saveBtnLabel,
  initialValues,
  runQuerySource,
  testQuerySource,
  onQueryRun,
  entityTypeDataSource,
  getParamsSource,
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
        setIsModalShown={setIsModalShown}
        isOpen={isModalShown}
        saveBtnLabel={saveBtnLabel}
        initialValues={initialValues}
        runQuerySource={runQuerySource}
        testQuerySource={testQuerySource}
        onQueryRun={onQueryRun}
        getParamsSource={getParamsSource}
        entityTypeDataSource={entityTypeDataSource}
      />
    </>
  );
};

QueryBuilder.propTypes = {
  disabled: PropTypes.bool,
  saveBtnLabel: PropTypes.string,
  initialValues: PropTypes.object,
  onQueryRun: PropTypes.func,
  runQuerySource: PropTypes.func,
  testQuerySource: PropTypes.func,
  getParamsSource: PropTypes.func,
  entityTypeDataSource: PropTypes.func,
};
