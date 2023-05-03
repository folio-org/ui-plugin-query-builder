import { mongoQueryToSource, sourceToMongoQuery } from './query';
import { booleanOptions } from './selectOptions';
import { OPERATORS } from '../../../constants/operators';
import { fieldOptions } from '../../../../test/jest/data/entityType';

describe('mongoQueryToSource()', () => {
  test('should return empty array for empty query', () => {
    const result = mongoQueryToSource({
      mongoQuery: {},
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
      value: { current: ['value', 'value2'] },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_full_name' },
      operator: { options: expect.any(Array), current: OPERATORS.STARTS_WITH },
      value: { current: 'abc' },
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
      value: { current: ['value', 'value2'] },
    },
  ];

  const mongoQuery = {
    $and: [
      { user_first_name: { $eq: 'value' } },
      { user_first_name: { $ne: 'value' } },
      { user_last_name: { $gt: 'value' } },
      { user_last_name: { $lt: 10 } },
      { user_last_name: { $gte: 'value' } },
      { languages: { $in: ['value', 'value2'] } },
      { user_full_name: { $regex: '/^abc/' } },
      { user_full_name: { $regex: '/abc/' } },
      { languages: { $nin: ['value', 'value2'] } },
    ],
  };

  it('should convert simple query to source format', () => {
    const result = mongoQueryToSource({
      mongoQuery,
      booleanOptions,
      fieldOptions,
      intl: { formatMessage: jest.fn() },
    });

    expect(result).toEqual(source);
  });

  it('should convert from source to simple query format', () => {
    const result = sourceToMongoQuery(source);

    expect(result).toEqual(mongoQuery);
  });
});
