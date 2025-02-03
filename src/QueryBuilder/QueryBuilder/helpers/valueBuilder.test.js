import { getCommaSeparatedStr, getQuotedStr, retainValueOnOperatorChange, valueBuilder } from './valueBuilder';
import { OPERATORS } from '../../../constants/operators';
import { fieldOptions } from '../../../../test/jest/data/entityType';

describe('valueBuilder', () => {
  test('should return a string enclosed in double quotes for StringType', () => {
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

  test('should return a string enclosed in double quotes for BooleanType', () => {
    const value = true;
    const field = 'user_active';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string enclosed in double quotes for ObjectType', () => {
    const value = { street: '123 Main St', city: 'Anytown' };
    const field = 'address';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string enclosed in double quotes for RangedUUIDType if value is not an array', () => {
    const value = 'id1, id2';
    const field = 'user_patron_group';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toEqual('"id1, id2"');
  });

  test('should return a string enclosed in parentheses for RangedUUIDType if value is an array', () => {
    const value = 'id';
    const field = 'user_patron_group';
    const operator = OPERATORS.IN;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value, true));
  });

  test('should return an empty string if value is falsy for DateType', () => {
    const value = null;
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe('');
  });

  test('should return a string enclosed in double quotes for DateType if value is truthy', () => {
    const value = '2024-11-06';
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    const intl = {
      formatDate: (val, { timeZone }) => `${val.toUTCString()} in ${timeZone}`,
    };

    expect(valueBuilder({ value, field, operator, fieldOptions, intl, timezone: 'Narnia' }))
      .toBe('"Wed, 06 Nov 2024 00:00:00 GMT in Narnia"');
  });

  test('should return the original string for an invalid date', () => {
    const value = 'invalid-date';
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe('"invalid-date"');
  });

  test('should return a string enclosed in double quotes for ArrayType if value is a string', () => {
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

  test('should return a string enclosed in double quotes for OpenUUIDType if operator is not IN or NOT_IN', () => {
    const value = 'val';
    const field = 'instance_id';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string enclosed in double quotes for StringUUIDType if operator is not IN or NOT_IN', () => {
    const value = 'val';
    const field = 'string_uuid';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string enclosed in double quotes for EnumType if value is a string', () => {
    const value = 'active';
    const field = 'status';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value));
  });

  test('should return a string enclosed in double quotes for String with in operator', () => {
    const value = '123,456,789';
    const field = 'item_holdingsrecord_id';
    const operator = OPERATORS.IN;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(getQuotedStr(value, true));
  });
});

describe('retainValueOnOperatorChange', () => {
  it('should return the previous value when the operator type is the same', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.EQUAL, 'someValue');

    expect(result).toBe('someValue');
  });

  it('should return the empty value', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.IN, 'someValue');

    expect(result).toBe('');
  });

  it('should return the empty value of the array when switching from comparison array to comparison', () => {
    const result = retainValueOnOperatorChange(OPERATORS.IN, OPERATORS.EQUAL, [1, 2, 3]);

    expect(result).toBe('');
  });

  it('should return an empty string when operator types are different and invalid', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.STARTS_WITH, 'someValue');

    expect(result).toBe('');
  });

  it('should return an empty string when the operator type is not found', () => {
    const result = retainValueOnOperatorChange(OPERATORS.EQUAL, OPERATORS.IN, 'someValue');

    expect(result).toBe('');
  });
});
