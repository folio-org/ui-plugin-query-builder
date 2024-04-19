import React from 'react';
import PropTypes from 'prop-types';
import css from './DynamicTable.css';

export const DynamicTable = ({ properties, values }) => {
  if (!values) return null;

  const tableBodyRows = JSON.parse(values);

  if (!tableBodyRows?.length) return null;

  return (
    <table className={css.DynamicTable}>
      <thead>
        <tr>{properties?.map((cell) => (
          <th key={cell.property} style={{ width: '180px', minWidth: '180px' }}>{cell.labelAlias}</th>
        ))}
        </tr>
      </thead>
      <tbody>
        {tableBodyRows.map((row, index) => (
          <tr key={index}>
            {properties?.map((cell) => (
              <td key={cell.property}>
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
