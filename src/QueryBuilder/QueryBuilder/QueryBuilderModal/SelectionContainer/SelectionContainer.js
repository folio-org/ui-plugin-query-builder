import PropTypes from 'prop-types';

export const SelectionContainer = ({ Selection, availableValues, onChange, getParamsSource, ...rest }) => {
  if (availableValues === undefined) {
    return (
      <Selection
        availableValues={availableValues}
        onChange={onChange}
        filter={getParamsSource}
        asyncFiltering
        {...rest}
      />);
  } else {
    return (
      <Selection
        availableValues={availableValues}
        onChange={onChange}
        {...rest}
      />
    );
  }
};

SelectionContainer.propTypes = {
  Selection: PropTypes.node,
  onChange: PropTypes.func,
  index: PropTypes.number,
  getParamsSource: PropTypes.func,
  availableValues: PropTypes.arrayOf(PropTypes.oneOf([PropTypes.bool, PropTypes.object])),
};