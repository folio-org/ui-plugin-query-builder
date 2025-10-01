import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import css from './DynamicTable.css';
import { formatValueByDataType } from '../utils';

export const DynamicTable = ({ columns = [], values = [] }) => {
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
                {formatValueByDataType(
                  row[column.id],
                  column.dataType,
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
};
