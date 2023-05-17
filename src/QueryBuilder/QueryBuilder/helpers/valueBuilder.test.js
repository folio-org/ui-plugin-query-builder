import moment from 'moment';
import { valueBuilder } from './valueBuilder';
import { OPERATORS } from '../../../constants/operators';
import { ISO_FORMAT } from './timeUtils';
import { fieldOptions } from '../../../../test/jest/data/entityType';

describe('valueBuilder', () => {
  test('should return a string enclosed in double quotes for StringType', () => {
    const value = 'John';
    const field = 'user_first_name';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`"${value}"`);
  });

  test('should return the same value for IntegerType', () => {
    const value = 42;
    const field = 'position';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(value);
  });

  test('should return a string enclosed in double quotes for BooleanType', () => {
    const value = true;
    const field = 'user_active';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`"${value}"`);
  });

  test('should return a string enclosed in double quotes for ObjectType', () => {
    const value = { street: '123 Main St', city: 'Anytown' };
    const field = 'address';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`"${value}"`);
  });

  test('should return a string enclosed in double quotes for RangedUUIDType if value is not an array', () => {
    const value = { label: 'UC Academic, Indefinite', value: 'Indefinite' };
    const field = 'user_patron_group';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toEqual({ label: 'UC Academic, Indefinite', value: 'Indefinite' });
  });

  test('should return a string enclosed in parentheses for RangedUUIDType if value is an array', () => {
    const value = [{ label: 'UC Academic, Indefinite', value: 'Indefinite' }];
    const field = 'user_patron_group';
    const operator = OPERATORS.IN;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`(${value.map(el => `"${el.value}"`).join(',')})`);
  });

  test('should return an empty string if value is falsy for DateType', () => {
    const value = null;
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe('');
  });

  test('should return a string enclosed in double quotes for DateType if value is truthy', () => {
    const value = new Date('2022-01-01');
    const field = 'user_expiration_date';
    const operator = OPERATORS.EQUAL;

    const date = moment(value);

    date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`"${date.format(ISO_FORMAT)}"`);
  });

  test('should return a string enclosed in double quotes for ArrayType if value is a string', () => {
    const value = 'fr';
    const field = 'languages';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`"${value}"`);
  });

  test('should return a string enclosed in parentheses for ArrayType if value is an array and operator is IN', () => {
    const value = [
      { label: 'English', value: 'eng' },
      { label: 'French', value: 'fra' },
    ];
    const field = 'languages';
    const operator = OPERATORS.IN;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`(${value?.map(el => `"${el.value}"`).join(',')})`);
  });

  test('should return a string enclosed in double quotes for OpenUUIDType if operator is not IN or NOT_IN', () => {
    const value = 'val';
    const field = 'instance_id';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`"${value}"`);
  });

  test('should return a string enclosed in double quotes for EnumType if value is a string', () => {
    const value = 'active';
    const field = 'status';
    const operator = OPERATORS.EQUAL;

    expect(valueBuilder({ value, field, operator, fieldOptions })).toBe(`"${value}"`);
  });
});
