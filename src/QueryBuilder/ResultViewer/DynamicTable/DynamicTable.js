import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { getNestedValue } from '../utils';
import css from './DynamicTable.css';

export const DynamicTable = ({ columns = [], values = [], formatter }) => {
  const intl = useIntl();

  if (!values?.length || !columns?.length) return null;

  return (
    <table className={css.DynamicTable}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} style={column.styles}>
              {column.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {values.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={column.id} style={column.styles}>
                {formatter(
                  getNestedValue(row, column.id),
                  column.dataType,
                  undefined,
                  intl,
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

DynamicTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    dataType: PropTypes.string,
    styles: PropTypes.shape({}),
  })),
  values: PropTypes.arrayOf(PropTypes.shape({})),
  formatter: PropTypes.func.isRequired,
};
