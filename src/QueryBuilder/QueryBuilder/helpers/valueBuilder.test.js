import { getCommaSeparatedStr, getQuotedStr, retainValueOnOperatorChange, valueBuilder } from './valueBuilder';
import { OPERATORS } from '../../../constants/operators';
import { fieldOptions } from '../../../../test/jest/data/entityType';
import { DATA_TYPES } from '../../../constants/dataTypes';

describe('valueBuilder', () => {
  test('should return a string for StringType', () => {
    const value = 'John';
    const field = 'user_first_name';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return the same value for IntegerType', () => {
    const value = 42;
    const field = 'position';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(value);
  });

  test('should return the same value for NumberType', () => {
    const value = 42.1;
    const field = 'decimal_position';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(value);
  });

  test('should return a string for BooleanType', () => {
    const value = true;
    const field = 'user_active';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string for ObjectType', () => {
    const value = { street: '123 Main St', city: 'Anytown' };
    const field = 'address';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string for RangedUUIDType if value is not an array', () => {
    const value = 'id1, id2';
    const field = 'user_patron_group';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toEqual('id1, id2');
  });

  test('should return a string enclosed in parentheses for RangedUUIDType if value is an array', () => {
    const value = 'id';
    const field = 'user_patron_group';
    const operator = OPERATORS.IN;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value, true));
  });

  test('should return an empty string if value is falsy for DateType', () => {
    const value = null;
    const field = 'loan_checkout_date';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe('');
  });

  test('should return raw YYYY-MM-DD string for DateType if value is truthy', () => {
    const value = '2024-11-06';
    const field = 'loan_checkout_date';
    const operator = OPERATORS.EQUAL;

    // intl/timezone should have no effect on DateType
    const intl = {
      formatDate: () => jest.fn(() => fail('should not be used')),
    };

    expect(valueBuilder({ value, field, operator, fieldOptions, intl, timezone: 'Narnia' }))
      .toBe('2024-11-06');
  });

  test('should return an empty string if value is falsy for DateTimeType', () => {
    const value = null;
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe('');
  });

  test('should return formatted string for DateTimeType if value is truthy (timezone aware)', () => {
    const value = '2024-11-06';
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    const intl = {
      formatDate: (val, { timeZone }) => `${val.toUTCString()} in ${timeZone}`,
    };

    expect(valueBuilder({ value, field, operator, fieldOptions, intl, timezone: 'Narnia' }))
      .toBe('Wed, 06 Nov 2024 00:00:00 GMT in Narnia');
  });

  test('should return the original string for an invalid date', () => {
    const value = 'invalid-date';
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe('invalid-date');
  });

  test('should return a string for ArrayType if value is a string', () => {
    const value = 'fr';
    const field = 'instance.languages';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string enclosed in parentheses for ArrayType if value is an array and operator is IN', () => {
    const value = [
      { label: 'English', value: 'eng' },
      { label: 'French', value: 'fra' },
    ];
    const field = 'instance.languages';
    const operator = OPERATORS.IN;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getCommaSeparatedStr(value));
  });

  test('should return a string for OpenUUIDType if operator is not IN or NOT_IN', () => {
    const value = 'val';
    const field = 'instance_id';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string for StringUUIDType if operator is not IN or NOT_IN', () => {
    const value = 'val';
    const field = 'string_uuid';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string for EnumType if value is a string', () => {
    const value = 'active';
    const field = 'status';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string for String with in operator', () => {
    const value = '123,456,789';
    const field = 'item_holdingsrecord_id';
    const operator = OPERATORS.IN;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value, true));
  });
});

describe('retainValueOnOperatorChange', () => {
  describe('when control type does not change and value should be retained', () => {
    test.each([
      {
        name: 'StringType EQUAL → NOT_EQUAL',
        prevValue: 'test',
        dataType: DATA_TYPES.StringType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'StringType EQUAL → IN (without options - both TEXT)',
        prevValue: 'test',
        dataType: DATA_TYPES.StringType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.IN,
      },
      {
        name: 'StringType IN → NOT_IN with options',
        prevValue: [{ label: 'Option 1', value: 'opt1' }],
        dataType: DATA_TYPES.StringType,
        operator: OPERATORS.IN,
        newOperator: OPERATORS.NOT_IN,
        source: [{ label: 'Option 1', value: 'opt1' }],
      },
      {
        name: 'IntegerType EQUAL → NOT_EQUAL without options',
        prevValue: 42,
        dataType: DATA_TYPES.IntegerType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'NumberType EQUAL → NOT_EQUAL without options',
        prevValue: 42.5,
        dataType: DATA_TYPES.NumberType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'BooleanType EQUAL → NOT_EQUAL',
        prevValue: true,
        dataType: DATA_TYPES.BooleanType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'DateType EQUAL → NOT_EQUAL',
        prevValue: '2024-11-06',
        dataType: DATA_TYPES.DateType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'DateTimeType EQUAL → NOT_EQUAL',
        prevValue: '2024-11-06T12:00:00Z',
        dataType: DATA_TYPES.DateTimeType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'OpenUUIDType EQUAL → NOT_EQUAL',
        prevValue: 'uuid-value',
        dataType: DATA_TYPES.OpenUUIDType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'OpenUUIDType IN → NOT_IN',
        prevValue: 'uuid1, uuid2',
        dataType: DATA_TYPES.OpenUUIDType,
        operator: OPERATORS.IN,
        newOperator: OPERATORS.NOT_IN,
      },
      {
        name: 'EnumType EQUAL → NOT_EQUAL',
        prevValue: 'active',
        dataType: DATA_TYPES.EnumType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'EnumType IN → NOT_IN',
        prevValue: ['active', 'inactive'],
        dataType: DATA_TYPES.EnumType,
        operator: OPERATORS.IN,
        newOperator: OPERATORS.NOT_IN,
      },
      {
        name: 'Unknown dataType defaults to TEXT control type',
        prevValue: 'test-value',
        dataType: 'UnknownDataType',
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
      },
      {
        name: 'Unknown operator defaults to TEXT control type',
        prevValue: 'test-value',
        dataType: DATA_TYPES.StringType,
        operator: OPERATORS.EQUAL,
        newOperator: 'unknownOperator',
      },
      {
        name: 'ArrayType with availableValues when control type does not change',
        prevValue: 'opt1',
        dataType: DATA_TYPES.ArrayType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.NOT_EQUAL,
        availableValues: [{ label: 'Option 1', value: 'opt1' }],
      },
    ])(
      '$name',
      ({ prevValue, dataType, operator, newOperator, source, availableValues }) => {
        const args = {
          dataType,
          operator,
          newOperator,
          prevValue,
        };

        if (source) {
          args.source = source;
        }

        if (availableValues) {
          args.availableValues = availableValues;
        }

        expect(retainValueOnOperatorChange(args)).toBe(prevValue);
      },
    );
  });

  describe('when control type changes or value should be transformed/reset', () => {
    test.each([
      {
        name: 'StringType EQUAL → IN with options',
        prevValue: 'test',
        dataType: DATA_TYPES.StringType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.IN,
        source: [{ label: 'Option 1', value: 'opt1' }],
        expected: [{ label: 'test', value: 'test' }],
      },
      {
        name: 'ArrayType EQUAL → IN with options',
        prevValue: 'opt1',
        dataType: DATA_TYPES.ArrayType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.IN,
        source: [{ label: 'Option 1', value: 'opt1' }],
        expected: [{ label: 'opt1', value: 'opt1' }],
      },
      {
        name: 'DateType → EMPTY operator',
        prevValue: '2024-11-06',
        dataType: DATA_TYPES.DateType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.EMPTY,
        expected: '',
      },
      {
        name: 'OpenUUIDType EQUAL → IN',
        prevValue: 'uuid-value',
        dataType: DATA_TYPES.OpenUUIDType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.IN,
        expected: '',
      },
      {
        name: 'EnumType EQUAL → IN',
        prevValue: 'active',
        dataType: DATA_TYPES.EnumType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.IN,
        expected: [{ label: 'active', value: 'active' }],
      },
      {
        name: 'StringType ANY → EMPTY operator',
        prevValue: 'test-value',
        dataType: DATA_TYPES.StringType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.EMPTY,
        expected: '',
      },
      {
        name: 'ArrayType control type changes with availableValues (EQUAL → IN)',
        prevValue: 'opt1',
        dataType: DATA_TYPES.ArrayType,
        operator: OPERATORS.EQUAL,
        newOperator: OPERATORS.IN,
        availableValues: [{ label: 'Option 1', value: 'opt1' }],
        expected: [{ label: 'Option 1', value: 'opt1' }],
      },
    ])(
      '$name',
      ({ prevValue, dataType, operator, newOperator, source, availableValues, expected }) => {
        const args = {
          dataType,
          operator,
          newOperator,
          prevValue,
        };

        if (source) {
          args.source = source;
        }

        if (availableValues) {
          args.availableValues = availableValues;
        }

        expect(retainValueOnOperatorChange(args)).toEqual(expected);
      },
    );
  });

  test('should convert SELECT_MULTI to SELECT_SINGLE using value property', () => {
    const prevValue = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;
    const source = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];

    expect(
      retainValueOnOperatorChange({
        dataType,
        operator,
        newOperator,
        source,
        prevValue,
      }),
    ).toBe('opt1');
  });

  test('should convert SELECT_MULTI to SELECT_SINGLE using id property when value is not available', () => {
    const prevValue = [
      { label: 'Option 1', id: 'id1' },
      { label: 'Option 2', id: 'id2' },
    ];
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;
    const source = [
      { label: 'Option 1', id: 'id1' },
      { label: 'Option 2', id: 'id2' },
    ];

    expect(
      retainValueOnOperatorChange({
        dataType,
        operator,
        newOperator,
        source,
        prevValue,
      }),
    ).toBe('id1');
  });

  test('should convert SELECT_MULTI to SELECT_SINGLE with empty array', () => {
    const prevValue = [];
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;
    const source = [{ label: 'Option 1', value: 'opt1' }];

    expect(
      retainValueOnOperatorChange({
        dataType,
        operator,
        newOperator,
        source,
        prevValue,
      }),
    ).toBe('');
  });

  test('should convert SELECT_SINGLE to SELECT_MULTI with label lookup', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const source = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];
    const availableValues = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];

    expect(
      retainValueOnOperatorChange({
        dataType,
        operator,
        newOperator,
        source,
        availableValues,
        prevValue,
      }),
    ).toEqual([
      {
        value: 'opt1',
        label: 'Option 1',
      },
    ]);
  });

  test('should convert SELECT_SINGLE to SELECT_MULTI with EnumType', () => {
    const prevValue = 'active';
    const dataType = DATA_TYPES.EnumType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const availableValues = [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ];

    expect(
      retainValueOnOperatorChange({
        dataType,
        operator,
        newOperator,
        availableValues,
        prevValue,
      }),
    ).toEqual([
      {
        value: 'active',
        label: 'Active',
      },
    ]);
  });

  test('should convert SELECT_MULTI to SELECT_SINGLE with EnumType', () => {
    const prevValue = [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ];
    const dataType = DATA_TYPES.EnumType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;

    expect(
      retainValueOnOperatorChange({
        dataType,
        operator,
        newOperator,
        prevValue,
      }),
    ).toBe('active');
  });
});
