import PropTypes from 'prop-types';
import { ResultViewer } from './ResultViewer';
import { QueryBuilder } from './QueryBuilder';

const VIEWER = 'viewer';
const BUILDER = 'builder';

export const QueryBuilderPlugin = ({ componentType, ...rest }) => {
  return (
    <>
      {componentType === VIEWER && <ResultViewer {...rest} />}
      {componentType === BUILDER && <QueryBuilder {...rest} />}
    </>
  );
};

QueryBuilderPlugin.propTypes = {
  componentType: PropTypes.oneOf([VIEWER, BUILDER]).isRequired,
};
