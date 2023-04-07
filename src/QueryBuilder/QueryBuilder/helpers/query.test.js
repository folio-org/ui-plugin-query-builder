import { mongoQueryToSource } from './query';

const booleanOptions = ['AND', 'OR'];
const fieldOptions = [
  { label: 'Field 1', value: 'field1', dataType: 'string' },
  { label: 'Field 2', value: 'field2', dataType: 'number' },
  { label: 'Field 3', value: 'field3', dataType: 'array' },
];

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
        { field1: { $eq: 'value1' } },
        { field2: { $lt: 10 } },
        { field3: { $gt: 12 } },
        { field4: { $ne: 20 } },
        { field5: { $in: ['value1', 'value2'] } },
        { field6: { $nin: ['value1', 'value2'] } },
        { field7: { $regex: /^abc/ } },
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
        field: { options: fieldOptions, current: 'field1' },
        operator: { options: expect.any(Array), current: '==' },
        value: { current: 'value1' },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'field2' },
        operator: { options: expect.any(Array), current: '<' },
        value: { current: 10 },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'field3' },
        operator: { options: expect.any(Array), current: '>' },
        value: { current: 12 },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'field4' },
        operator: { options: expect.any(Array), current: '!=' },
        value: { current: 20 },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'field5' },
        operator: { options: expect.any(Array), current: 'in' },
        value: { current: ['value1', 'value2'] },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'field6' },
        operator: { options: expect.any(Array), current: 'not in' },
        value: { current: ['value1', 'value2'] },
      },
      {
        boolean: { options: booleanOptions, current: 'AND' },
        field: { options: fieldOptions, current: 'field7' },
        operator: { options: expect.any(Array), current: 'starts with' },
        value: { current: 'abc' },
      },
    ]);
  });
});
