import PropTypes from 'prop-types';
import QueryViewer from './QueryViewer/QueryViewer';
import QueryBuilderModal from './QueryBuilderModal/QueryBuilderModal';

export const QueryBuilder = ({ componentType, ...rest }) => {
  if (componentType === 'viewer') return <QueryViewer {...rest} />;
  if (componentType === 'builder') return <QueryBuilderModal {...rest} />;

  return <strong>componentType is required!</strong>;
};

QueryBuilder.propTypes = {
  componentType: PropTypes.oneOf(['viewer', 'builder']).isRequired,
};
