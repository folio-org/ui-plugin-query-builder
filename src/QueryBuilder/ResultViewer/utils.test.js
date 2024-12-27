import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { DATA_TYPES } from '../../constants/dataTypes';
import { formatValueByDataType } from './utils';

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
