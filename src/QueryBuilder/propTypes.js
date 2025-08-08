import PropTypes from 'prop-types';

export const queryBuilderModalPropTypes = {
  isOpen: PropTypes.bool,
  setIsModalShown: PropTypes.func,
  runQueryDataSource: PropTypes.func,
  testQueryDataSource: PropTypes.func,
  cancelQueryDataSource: PropTypes.func,
  queryDetailsDataSource: PropTypes.func,
  recordColumns: PropTypes.arrayOf(PropTypes.string),
  initialValues: PropTypes.object,
  saveBtnLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  onSetDefaultVisibleColumns: PropTypes.func,
  entityTypeDataSource: PropTypes.func,
  getParamsSource: PropTypes.func,
  getOrganizations: PropTypes.func,
  onQueryRunSuccess: PropTypes.func,
  onQueryRunFail: PropTypes.func,
  onQueryExecutionSuccess: PropTypes.func,
  onQueryExecutionFail: PropTypes.func,
  recordsLimit: PropTypes.number,
};
