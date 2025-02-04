import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { DATA_TYPES } from '../../constants/dataTypes';
import { findLabelByValue, formatValueByDataType } from './utils';

describe('formatValueByDataType returns correct value', () => {
  test.each([
    [undefined, DATA_TYPES.StringType, ''],
    [null, DATA_TYPES.StringType, ''],

    [true, DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.true'],
    [false, DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.false'],
    ['true', DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.true'],
    ['false', DATA_TYPES.BooleanType, 'ui-plugin-query-builder.options.false'],

    ['2024-01-01T12:30:00Z', DATA_TYPES.StringType, '2024-01-01T12:30:00Z'],
    ['2024-01-01T12:30:00Z', DATA_TYPES.DateType, '1/1/2024'],
    ['2024-01-01T12:30:00Z', DATA_TYPES.DateType, '1/1/2024'],

    [[], DATA_TYPES.ArrayType, ''],
    [['a'], DATA_TYPES.ArrayType, 'a'],
    [['a', 'b', 'c'], DATA_TYPES.ArrayType, 'a | b | c'],

    [1234, DATA_TYPES.IntegerType, '1234'],
    [12.34, DATA_TYPES.NumberType, '12.34'],

    [false, DATA_TYPES.StringType, ''],
    ['foo', DATA_TYPES.StringType, 'foo'],
  ])('value=%j of type=%p renders to %p', (value, type, expected) => {
    const formatted = formatValueByDataType(value, type, null);

    if (typeof formatted === 'string') {
      expect(formatted).toBe(expected);
    } else {
      expect(render(<IntlProvider>{formatted}</IntlProvider>).container.innerHTML).toBe(expected);
    }
  });
});

describe('findLabelByValue', () => {
  const mockOptions = {
    options: [
      { value: 'opt_1', label: 'Option 1' },
      { value: 'opt_2', label: 'Option 2' },
      { value: '_custom_field_123', label: 'Custom Field 123' },
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
