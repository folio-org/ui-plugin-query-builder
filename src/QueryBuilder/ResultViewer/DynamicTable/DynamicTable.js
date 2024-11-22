import React from 'react';
import PropTypes from 'prop-types';

import css from './DynamicTable.css';

const columnStyle = { width: '180px', minWidth: '180px' };

export const DynamicTable = ({ properties, values }) => {
  if (!values) return null;

  if (!values.length) return null;

  return (
    <table className={css.DynamicTable}>
      <thead>
        <tr>
          {properties?.map((cell) => (
            <th key={cell.property} style={columnStyle}>
              {cell.labelAlias}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {values?.map((row, index) => (
          <tr key={index}>
            {row?.map((cell, cellIndex) => (
              <td key={cellIndex} style={columnStyle}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

DynamicTable.propTypes = {
  properties: PropTypes.arrayOf(PropTypes.object),
  values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};
