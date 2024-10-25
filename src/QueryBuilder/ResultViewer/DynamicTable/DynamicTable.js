import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import css from './DynamicTable.css';

const columnStyle = { width: '180px', minWidth: '180px' };

function getCellValue(row, property) {
  // typeof check to ensure we don't try to display null/undefined as a booleans
  if (property.dataType.dataType === 'booleanType' && typeof row[property.property] === 'boolean') {
    return row[property.property] ? (
      <FormattedMessage id="ui-plugin-query-builder.options.true" />
    ) : (
      <FormattedMessage id="ui-plugin-query-builder.options.false" />
    );
  }

  return row[property.property];
}

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
                {getCellValue(row, cell)}
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
