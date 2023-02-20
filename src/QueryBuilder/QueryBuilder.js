import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ResultViewer } from './ResultViewer';
import { QueryBuilderModal } from './QueryBuilderModal';

const VIEWER = 'viewer';
const BUILDER = 'builder';

export const QueryBuilder = ({ componentType, ...rest }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {componentType === VIEWER && <ResultViewer {...rest} />}
      {componentType === BUILDER && <QueryBuilderModal {...rest} />}
    </QueryClientProvider>
  );
};

QueryBuilder.propTypes = {
  componentType: PropTypes.oneOf([VIEWER, BUILDER]).isRequired,
};
