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
  test('should return the previous value when the operator type is the same', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.EQUAL, DATA_TYPES.StringType, 'someValue');

    expect(result).toBe('someValue');
  });

  test('should return the previous value when switching between comparison and comparison array', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.IN, DATA_TYPES.StringType, 'someValue', [{
      label: 'someLabel', value: 'someValue',
    }]);

    expect(result).toEqual([{ label: 'someLabel', value: 'someValue' }]);
  });

  test('should return the first value of the array when switching from comparison array to comparison', () => {
    const result = retainValueOnOperatorChange(OPERATORS.IN, OPERATORS.EQUAL, DATA_TYPES.StringType, [
      { value: 1, label: 'First value' },
      { value: 2, label: 'Second value' },
      { value: 3, label: 'Third value' },
    ]);

    expect(result).toBe(1);
  });

  test('should return an empty string when operator types are different and incompatible', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.STARTS_WITH, DATA_TYPES.StringType, 'someValue');

    expect(result).toBe('');
  });

  test('should return an empty string when previous value is an empty string', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.IN, DATA_TYPES.StringType, '');

    expect(result).toBe('');
  });

  test('should fallback to prevValue as label when option label is not found', () => {
    const result = retainValueOnOperatorChange(
      OPERATORS.EQUAL,
      OPERATORS.IN,
      DATA_TYPES.StringType,
      'Previous value',
      [
        { label: 'Some Label', value: 'Some value' },
      ],
    );

    expect(result).toEqual([
      { label: 'Previous value', value: 'Previous value' },
    ]);
  });
});
