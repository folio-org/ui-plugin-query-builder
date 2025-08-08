import PropTypes from 'prop-types';
import { RootContext } from '../context/RootContext';
import { QueryBuilder } from './QueryBuilder';
import { ResultViewer } from './ResultViewer';
import { useDataOptions } from '../hooks/useDataOptions';

const VIEWER = 'viewer';
const BUILDER = 'builder';

export const QueryBuilderPlugin = ({ componentType, ...rest }) => {
  const dataOptions = useDataOptions({
    getParamsSource: rest.getParamsSource,
    getOrganizations: rest.getOrganizations,
  });

  return (
    <RootContext.Provider value={dataOptions}>
      {componentType === VIEWER && <ResultViewer {...rest} />}
      {componentType === BUILDER && <QueryBuilder {...rest} />}
    </RootContext.Provider>
  );
};

QueryBuilderPlugin.propTypes = {
  componentType: PropTypes.oneOf([VIEWER, BUILDER]).isRequired,
};
