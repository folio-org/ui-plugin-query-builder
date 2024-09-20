import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import css from './DynamicTable.css';

const columnStyle = { width: '180px', minWidth: '180px' };

export const DynamicTable = ({ properties, values }) => {
  const tableBodyRows = useMemo(() => JSON.parse(values ?? '[]'), [values]);

  if (!values) return null;

  if (!tableBodyRows?.length) return null;

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
        {tableBodyRows.map((row, index) => (
          <tr key={index}>
            {properties?.map((cell) => (
              <td key={cell.property} style={columnStyle}>
                {row[cell.property]}
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
  values: PropTypes.string,
};
