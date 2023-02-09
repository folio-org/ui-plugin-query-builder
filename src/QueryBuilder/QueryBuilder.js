import PropTypes from 'prop-types';
import { ResultViewer } from './ResultViewer';
import { QueryBuilderModal } from './QueryBuilderModal';

const VIEWER = 'viewer';
const BUILDER = 'builder';

export const QueryBuilder = ({ componentType, ...rest }) => {
  if (componentType === VIEWER) return <ResultViewer {...rest} />;
  if (componentType === BUILDER) return <QueryBuilderModal {...rest} />;

  return <strong>componentType is required!</strong>;
};

QueryBuilder.propTypes = {
  componentType: PropTypes.oneOf([VIEWER, BUILDER]).isRequired,
};
