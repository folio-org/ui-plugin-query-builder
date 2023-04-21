import { getFieldOptions } from './selectOptions';

const entityType = {
  columns: [
    {
      'name': 'user_full_name',
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User full name',
      'visibleByDefault': true,
    },
    {
      'name': 'user_active',
      'dataType': {
        'dataType': 'booleanType',
      },
      'labelAlias': 'User active',
      'visibleByDefault': true,
      'values': [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ],
    },
  ],
};

const result = [
  { dataType: 'stringType',
    label: 'User full name',
    value: 'user_full_name',
    values: undefined },
  { dataType: 'booleanType',
    label: 'User active',
    value: 'user_active',
    values: [
      { label: 'True',
        value: 'true' },
      { label: 'False',
        value: 'false' },
    ] }];

describe('mongoQueryToSource()', () => {
  test('should return empty array for empty query', () => {
    expect(getFieldOptions(entityType)).toEqual(result);
  });
});