import { mongoQueryToSource, sourceToMongoQuery } from './query';
import { booleanOptions } from './selectOptions';
import { OPERATORS } from '../../../constants/operators';
import { fieldOptions } from '../../../../test/jest/data/entityType';

describe('mongoQueryToSource()', () => {
  test('should return empty array for empty query', async () => {
    const result = await mongoQueryToSource({
      initialValues: {},
      booleanOptions,
      fieldOptions,
      intl: { formatMessage: jest.fn() },
    });

    expect(result).toEqual([]);
  });

  const source = [
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_first_name' },
      operator: { options: expect.any(Array), current: OPERATORS.EQUAL },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_first_name' },
      operator: { options: expect.any(Array), current: OPERATORS.NOT_EQUAL },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: OPERATORS.GREATER_THAN },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: OPERATORS.LESS_THAN },
      value: { current: 10 },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: OPERATORS.GREATER_THAN_OR_EQUAL },
      value: { current: 'value' },
    },

    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'languages' },
      operator: { options: expect.any(Array), current: OPERATORS.IN },
      value: { current: [{ label: 'value', value: 'value' }, { label: 'value2', value: 'value2' }] },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_full_name' },
      operator: { options: expect.any(Array), current: OPERATORS.CONTAINS },
      value: { current: 'abc' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'languages' },
      operator: { options: expect.any(Array), current: OPERATORS.NOT_IN },
      value: { current: [{ label: 'value', value: 'value' }, { label: 'value2', value: 'value2' }] },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_id' },
      operator: { options: expect.any(Array), current: OPERATORS.NOT_IN },
      value: { current: 'value, value2' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_id' },
      operator: { options: expect.any(Array), current: OPERATORS.IN },
      value: { current: 'value, value2' },
    },
  ];

  const initialValues = {
    $and: [
      { user_first_name: { $eq: 'value' } },
      { user_first_name: { $ne: 'value' } },
      { user_last_name: { $gt: 'value' } },
      { user_last_name: { $lt: 10 } },
      { user_last_name: { $gte: 'value' } },
      { languages: { $in: ['value', 'value2'] } },
      { user_full_name: { $regex: 'abc' } },
      { languages: { $nin: ['value', 'value2'] } },
      { user_id: { $nin: ['value', 'value2'] } },
      { user_id: { $in: ['value', 'value2'] } },
    ],
  };

  it('should convert simple query to source format', async () => {
    const result = await mongoQueryToSource({
      initialValues,
      booleanOptions,
      fieldOptions,
      intl: { formatMessage: jest.fn() },
    });

    const getCurrentValue = (v) => {
      const currentValue = v.value.current;
      const currentOperator = v.operator.current;

      if (typeof currentValue === 'string' && [OPERATORS.IN, OPERATORS.NOT_IN].includes(currentOperator)) {
        return currentValue.split(',').map(item => item.trim());
      }

      return Array.isArray(currentValue) ? currentValue.map(({ value }) => value) : currentValue;
    };

    expect(result).toEqual(source.map(v => ({
      ...v,
      field: {
        ...v.field,
        dataType: fieldOptions.find(({ value }) => value === v.field.current).dataType,
      },
      operator: {
        ...v.operator,
        dataType: fieldOptions.find(({ value }) => value === v.field.current).dataType,
      },
      value: {
        current: getCurrentValue(v),
        source: undefined,
        options: fieldOptions.find(({ value }) => value === v.field.current).values,
      },
    })));
  });

  it('should convert from source to simple query format', () => {
    const initial = {
      $and: [
        { user_first_name: { $eq: 'value' } },
        { user_first_name: { $ne: 'value' } },
        { user_last_name: { $gt: 'value' } },
        { user_last_name: { $lt: 10 } },
        { user_last_name: { $gte: 'value' } },
        { languages: { $in: ['value', 'value2'] } },
        { user_full_name: { $regex: 'abc' } },
        { languages: { $nin: ['value', 'value2'] } },
        { user_id: { $nin: ['value', 'value2'] } },
        { user_id: { $in: ['value', 'value2'] } },
      ],
    };

    const result = sourceToMongoQuery(source);

    expect(result).toEqual(initial);
  });
});
