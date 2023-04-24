import PropTypes from 'prop-types';

export const queryBuilderModalPropTypes = {
  isOpen: PropTypes.bool,
  setIsModalShown: PropTypes.func,
  runQueryDataSource: PropTypes.func,
  testQueryDataSource: PropTypes.func,
  queryDetailsDataSource: PropTypes.func,
  initialValues: PropTypes.object,
  onQueryRunSuccess: PropTypes.func,
  onQueryRunFail: PropTypes.func,
  saveBtnLabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  entityTypeDataSource: PropTypes.func,
  getParamsSource: PropTypes.func,
};
