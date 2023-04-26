import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResultViewer } from './ResultViewer';
import { QueryBuilder } from './QueryBuilder';

const VIEWER = 'viewer';
const BUILDER = 'builder';

export const QueryBuilderPlugin = ({ componentType, ...rest }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {componentType === VIEWER && <ResultViewer {...rest} />}
      {componentType === BUILDER && <QueryBuilder {...rest} />}
    </QueryClientProvider>
  );
};

QueryBuilderPlugin.propTypes = {
  componentType: PropTypes.oneOf([VIEWER, BUILDER]).isRequired,
};
