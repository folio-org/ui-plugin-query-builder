import { mongoQueryToSource, sourceToMongoQuery } from './query';
import { booleanOptions, fieldOptions } from './selectOptions';

describe('mongoQueryToSource()', () => {
  test('should return empty array for empty query', () => {
    const result = mongoQueryToSource({
      mongoQuery: {},
      booleanOptions,
      fieldOptions,
    });

    expect(result).toEqual([]);
  });

  const source = [
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_first_name' },
      operator: { options: expect.any(Array), current: '==' },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_first_name' },
      operator: { options: expect.any(Array), current: '!=' },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: '>' },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: '<' },
      value: { current: 10 },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: '>=' },
      value: { current: 'value' },
    },

    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'languages' },
      operator: { options: expect.any(Array), current: 'in' },
      value: { current: ['value', 'value2'] },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_full_name' },
      operator: { options: expect.any(Array), current: 'starts with' },
      value: { current: 'abc' },
    },
    {
      boolean: { options: booleanOptions, current: 'AND' },
      field: { options: fieldOptions, current: 'user_full_name' },
      operator: { options: expect.any(Array), current: 'contains' },
      value: { current: 'abc' },
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
    ],
  };

  it('should convert simple query to source format', () => {
    const result = mongoQueryToSource({
      mongoQuery,
      booleanOptions,
      fieldOptions,
    });

    expect(result).toEqual(source);
  });

  it('should convert from source to simple query format', () => {
    const result = sourceToMongoQuery(source);

    expect(result).toEqual(mongoQuery);
  });
});
