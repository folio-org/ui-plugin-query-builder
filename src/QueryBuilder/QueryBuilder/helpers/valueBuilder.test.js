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
  test('should return prevValue when control type does not change (EQUAL to NOT_EQUAL on StringType)', () => {
    const prevValue = 'test';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when control type does not change (EQUAL to IN on StringType without options - both TEXT)', () => {
    const prevValue = 'test';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return empty string when control type changes (EQUAL to IN on StringType with options)', () => {
    const prevValue = 'test';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const source = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      prevValue,
    })).toStrictEqual([{ 'label': 'test', 'value': 'test' }]);
  });

  test('should return prevValue when control type does not change (IN to NOT_IN on StringType with options)', () => {
    const prevValue = [{ label: 'Option 1', value: 'opt1' }];
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.NOT_IN;
    const source = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when control type does not change (EQUAL to NOT_EQUAL on IntegerType without options)', () => {
    const prevValue = 42;
    const dataType = DATA_TYPES.IntegerType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when control type does not change (EQUAL to NOT_EQUAL on NumberType without options)', () => {
    const prevValue = 42.5;
    const dataType = DATA_TYPES.NumberType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return empty string when control type changes (ArrayType EQUAL to IN with options)', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.ArrayType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const source = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      prevValue,
    })).toStrictEqual([{ 'label': 'opt1', 'value': 'opt1' }]);
  });

  test('should return prevValue when control type does not change (BooleanType EQUAL to NOT_EQUAL)', () => {
    const prevValue = true;
    const dataType = DATA_TYPES.BooleanType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when control type does not change (DateType EQUAL to NOT_EQUAL)', () => {
    const prevValue = '2024-11-06';
    const dataType = DATA_TYPES.DateType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return empty string when control type changes (DateType to EMPTY operator)', () => {
    const prevValue = '2024-11-06';
    const dataType = DATA_TYPES.DateType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.EMPTY;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe('');
  });

  test('should return prevValue when control type does not change (DateTimeType EQUAL to NOT_EQUAL)', () => {
    const prevValue = '2024-11-06T12:00:00Z';
    const dataType = DATA_TYPES.DateTimeType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when control type does not change (OpenUUIDType EQUAL to NOT_EQUAL)', () => {
    const prevValue = 'uuid-value';
    const dataType = DATA_TYPES.OpenUUIDType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return empty string when control type changes (OpenUUIDType EQUAL to IN)', () => {
    const prevValue = 'uuid-value';
    const dataType = DATA_TYPES.OpenUUIDType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe('');
  });

  test('should return prevValue when control type does not change (OpenUUIDType IN to NOT_IN)', () => {
    const prevValue = 'uuid1, uuid2';
    const dataType = DATA_TYPES.OpenUUIDType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.NOT_IN;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when control type does not change (EnumType EQUAL to NOT_EQUAL)', () => {
    const prevValue = 'active';
    const dataType = DATA_TYPES.EnumType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return empty string when control type changes (EnumType EQUAL to IN)', () => {
    const prevValue = 'active';
    const dataType = DATA_TYPES.EnumType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toStrictEqual([{ 'label': 'active', 'value': 'active' }]);
  });

  test('should return prevValue when control type does not change (EnumType IN to NOT_IN)', () => {
    const prevValue = ['active', 'inactive'];
    const dataType = DATA_TYPES.EnumType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.NOT_IN;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return empty string when operator becomes EMPTY', () => {
    const prevValue = 'test-value';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.EMPTY;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe('');
  });

  test('should return prevValue when unknown dataType defaults to TEXT control type', () => {
    const prevValue = 'test-value';
    const dataType = 'UnknownDataType';
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when unknown operator defaults to TEXT control type', () => {
    const prevValue = 'test-value';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = 'unknownOperator';

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return prevValue when control type does not change with availableValues', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.ArrayType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.NOT_EQUAL;
    const availableValues = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      availableValues,
      prevValue,
    })).toBe(prevValue);
  });

  test('should return empty string when control type changes with availableValues', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.ArrayType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const availableValues = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      availableValues,
      prevValue,
    })).toStrictEqual([{ 'label': 'Option 1', 'value': 'opt1' }]);
  });

  // Tests for select multi to single conversion
  test('should convert SELECT_MULTI to SELECT_SINGLE using value property', () => {
    const prevValue = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ];
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;
    const source = [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      prevValue,
    })).toBe('opt1');
  });

  test('should convert SELECT_MULTI to SELECT_SINGLE using id property when value is not available', () => {
    const prevValue = [
      { label: 'Option 1', id: 'id1' },
      { label: 'Option 2', id: 'id2' },
    ];
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;
    const source = [{ label: 'Option 1', id: 'id1' }, { label: 'Option 2', id: 'id2' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      prevValue,
    })).toBe('id1');
  });

  test('should return prevValue when converting SELECT_MULTI to SELECT_SINGLE with non-array value', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;
    const source = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      prevValue,
    })).toBe('');
  });

  test('should convert SELECT_MULTI to SELECT_SINGLE with empty array', () => {
    const prevValue = [];
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;
    const source = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      prevValue,
    })).toBe(undefined);
  });

  // Tests for select single to multi conversion
  test('should convert SELECT_SINGLE to SELECT_MULTI with label lookup', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const source = [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }];
    const availableValues = [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      availableValues,
      prevValue,
    })).toEqual([{
      value: 'opt1',
      label: 'Option 1',
    }]);
  });

  test('should convert SELECT_SINGLE to SELECT_MULTI using prevValue as fallback label', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const source = [{ label: 'Option 1', value: 'opt1' }];
    const availableValues = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      availableValues,
      prevValue,
    })).toEqual([{
      value: 'opt1',
      label: 'Option 1',
    }]);
  });

  test('should convert SELECT_SINGLE to SELECT_MULTI with fallback when label not found', () => {
    const prevValue = 'opt1';
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const source = [{ label: 'Option 2', value: 'opt2' }];
    const availableValues = [{ label: 'Option 2', value: 'opt2' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      availableValues,
      prevValue,
    })).toEqual([{
      value: 'opt1',
      label: 'opt1',
    }]);
  });

  test('should return prevValue when converting SELECT_SINGLE to SELECT_MULTI with falsy value', () => {
    const prevValue = null;
    const dataType = DATA_TYPES.StringType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const source = [{ label: 'Option 1', value: 'opt1' }];
    const availableValues = [{ label: 'Option 1', value: 'opt1' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      source,
      availableValues,
      prevValue,
    })).toBe(null);
  });

  test('should convert SELECT_SINGLE to SELECT_MULTI with EnumType', () => {
    const prevValue = 'active';
    const dataType = DATA_TYPES.EnumType;
    const operator = OPERATORS.EQUAL;
    const newOperator = OPERATORS.IN;
    const availableValues = [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }];

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      availableValues,
      prevValue,
    })).toEqual([{
      value: 'active',
      label: 'Active',
    }]);
  });

  test('should convert SELECT_MULTI to SELECT_SINGLE with EnumType', () => {
    const prevValue = [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }];
    const dataType = DATA_TYPES.EnumType;
    const operator = OPERATORS.IN;
    const newOperator = OPERATORS.EQUAL;

    expect(retainValueOnOperatorChange({
      dataType,
      operator,
      newOperator,
      prevValue,
    })).toBe('active');
  });
});
