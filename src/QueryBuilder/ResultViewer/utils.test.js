import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { DATA_TYPES } from '../../constants/dataTypes';
import { findLabelByValue, formatValueByDataType } from './utils';

jest.mock('./DynamicTable/DynamicTable', () => ({
  __esModule: true,
  DynamicTable: jest.fn(({ columns, values }) => (
    <div
      data-testid="dynamic-table"
      data-columns={JSON.stringify(columns)}
      data-values={JSON.stringify(values)}
    />
  )),
}));

describe('formatValueByDataType returns correct value', () => {
  test.each([
    [undefined, DATA_TYPES.StringType, ''],
    [null, DATA_TYPES.StringType, ''],

    [true, DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.true'],
    [false, DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.false'],
    ['true', DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.true'],
    ['false', DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.false'],

    ['2024-01-01T12:30:00Z', DATA_TYPES.StringType, '2024-01-01T12:30:00Z'],
    // DateType: raw YYYY-MM-DD preserved
    ['2024-01-01', DATA_TYPES.DateType, '2024-01-01'],
    ['2024-01-1', DATA_TYPES.DateType, '2024-01-1'],
    // DateTimeType: formatted (locale dependent). Our test env default shows M/D/YYYY
    ['2024-01-01T12:30:00Z', DATA_TYPES.DateTimeType, '1/1/2024'],

    [[], DATA_TYPES.ArrayType, ''],
    [['a'], DATA_TYPES.ArrayType, 'a'],
    [['a', 'b', 'c'], DATA_TYPES.ArrayType, 'a | b | c'],

    [1234, DATA_TYPES.IntegerType, '1234'],
    [12.34, DATA_TYPES.NumberType, '12.34'],

    [false, DATA_TYPES.StringType, ''],
    ['foo', DATA_TYPES.StringType, 'foo'],

    [<div>value</div>, DATA_TYPES.BooleanType, '<div>value</div>'],
  ])('value=%j of type=%p renders to %p', (value, type, expected) => {
    const formatted = formatValueByDataType(value, type, null, null);

    if (typeof formatted === 'string') {
      expect(formatted).toBe(expected);
    } else {
      expect(render(<IntlProvider locale="en">{formatted}</IntlProvider>).container.innerHTML).toBe(
        expected,
      );
    }
  });

  it('renders a DynamicTable for columns with nested properties and parses JSON values', () => {
    const column = {
      labelAlias: 'Tags',
      name: 'tags',
      visibleByDefault: false,
      dataType: {
        dataType: 'arrayType',
        itemDataType: {
          properties: [
            { property: 'id', labelAlias: 'ID', dataType: { dataType: 'stringType' } },
            { property: 'name', labelAlias: 'Name', dataType: { dataType: 'stringType' } },
            { property: 'active', labelAlias: 'Active', dataType: { dataType: 'booleanType' } },
          ],
        },
      },
    };

    const valuesJSON = JSON.stringify([
      { id: 't1', name: 'alpha', active: true },
      { id: 't2', name: 'beta', active: false },
    ]);

    const TestComponent = () => (
      <>
        {formatValueByDataType(
          valuesJSON,
          'objectType',
          column.dataType.itemDataType.properties,
          null,
        )}
      </>
    );

    render(<TestComponent />);

    const table = screen.getByTestId('dynamic-table');
    const passedColumns = JSON.parse(table.getAttribute('data-columns') || '[]');
    const passedValues = JSON.parse(table.getAttribute('data-values') || '[]');

    expect(passedColumns).toEqual([
      {
        id: 'id',
        name: 'ID',
        dataType: 'stringType',
        styles: { width: '180px', minWidth: '180px' },
      },
      {
        id: 'name',
        name: 'Name',
        dataType: 'stringType',
        styles: { width: '180px', minWidth: '180px' },
      },
      {
        id: 'active',
        name: 'Active',
        dataType: 'booleanType',
        styles: { width: '180px', minWidth: '180px' },
      },
    ]);

    expect(passedValues).toEqual([
      { id: 't1', name: 'alpha', active: true },
      { id: 't2', name: 'beta', active: false },
    ]);
  });
});

describe('findLabelByValue', () => {
  const mockOptions = {
    options: [
      { value: 'opt_1', label: 'Option 1' },
      { value: 'opt_2', label: 'Option 2' },
      { value: '_custom_field_123', label: 'Custom Field 123' },
      { value: 'nested._custom_field_456', label: 'Nested - Custom Field 456' },
    ],
  };

  it('should return the value if it does not start with _custom_field or opt_', () => {
    expect(findLabelByValue(mockOptions, 'random_value')).toBe('random_value');
  });

  it('should return the value if it is an array', () => {
    expect(findLabelByValue(mockOptions, ['opt_1', 'opt_2'])).toEqual(['opt_1', 'opt_2']);
  });

  it('should return the label if the value exists in options', () => {
    expect(findLabelByValue(mockOptions, 'opt_1')).toBe('Option 1');
    expect(findLabelByValue(mockOptions, '_custom_field_123')).toBe('Custom Field 123');
  });

  it('should return undefined if the value is not found in options', () => {
    expect(findLabelByValue(mockOptions, 'opt_999')).toBeUndefined();
  });

  it('should handle null or undefined options without throwing an error', () => {
    expect(findLabelByValue(null, 'opt_1')).toBeUndefined();
    expect(findLabelByValue(undefined, 'opt_1')).toBeUndefined();
  });
});
