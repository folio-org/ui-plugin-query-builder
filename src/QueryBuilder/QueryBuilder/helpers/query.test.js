import { mongoQueryToSource } from './query';
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

  test('should convert simple query to source format', () => {
    const mongoQuery = {
      $and: [
        { user_first_name: { $eq: 'value1' } },
        { user_last_name: { $lt: 10 } },
        { languages: { $in: ['value1', 'value2'] } },
        { user_full_name: { $regex: '/^abc/' } },
        { user_full_name: { $regex: '/abc/' } },
      ],
    };

    const result = mongoQueryToSource({
      mongoQuery,
      booleanOptions,
      fieldOptions,
    });

    expect(result).toEqual([
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'user_first_name' },
        operator: { options: expect.any(Array), current: '==' },
        value: { current: 'value1' },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'user_last_name' },
        operator: { options: expect.any(Array), current: '<' },
        value: { current: 10 },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'languages' },
        operator: { options: expect.any(Array), current: 'in' },
        value: { current: ['value1', 'value2'] },
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
    ]);
  });
});
