import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import css from './DynamicTable.css';
import { formatValueByDataType } from '../utils';

const columnStyle = { width: '180px', minWidth: '180px' };

export const DynamicTable = ({ properties, values }) => {
  const tableBodyRows = useMemo(() => JSON.parse(values ?? '[]'), [values]);
  const intl = useIntl();

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
        {tableBodyRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {properties?.map((cell) => (
              <td key={cell.property} style={columnStyle}>
                {formatValueByDataType(
                  row[cell.property],
                  cell.dataType.dataType,
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
  properties: PropTypes.arrayOf(PropTypes.shape({
    property: PropTypes.string.isRequired,
    labelAlias: PropTypes.string.isRequired,
    dataType: PropTypes.shape({
      dataType: PropTypes.string.isRequired,
    }).isRequired,
  })),
  values: PropTypes.string,
};
