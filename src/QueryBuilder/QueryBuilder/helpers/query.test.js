import {findMissingValues, getTransformedValue, isQueryValid, mongoQueryToSource, sourceToMongoQuery} from './query';
import { booleanOptions } from './selectOptions';
import { OPERATORS } from '../../../constants/operators';
import { fieldOptions } from '../../../../test/jest/data/entityType';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { COLUMN_KEYS } from '../../../constants/columnKeys';

describe('mongoQueryToSource()', () => {
  test('should return empty array for empty query', async () => {
    const result = await mongoQueryToSource({
      initialValues: {},
      booleanOptions,
      fieldOptions,
      intl: { formatMessage: jest.fn() },
      getParamsSource: jest.fn(),
    });

    expect(result).toEqual([]);
  });

  const singleSource = [{
    boolean: { options: [{ label: 'AND', value: '' }], current: '' },
    field: { options: fieldOptions, current: 'user_first_name', dataType: 'stringType' },
    operator: { options: expect.any(Array), current: OPERATORS.EQUAL, dataType: 'stringType' },
    value: { current: 'value', options: undefined, source: undefined },
  }];

  const source = [
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_first_name' },
      operator: { options: expect.any(Array), current: OPERATORS.EQUAL },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_first_name' },
      operator: { options: expect.any(Array), current: OPERATORS.NOT_EQUAL },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: OPERATORS.GREATER_THAN },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: OPERATORS.LESS_THAN },
      value: { current: 10 },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_last_name' },
      operator: { options: expect.any(Array), current: OPERATORS.GREATER_THAN_OR_EQUAL },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_full_name' },
      operator: { options: expect.any(Array), current: OPERATORS.CONTAINS },
      value: { current: 'abc' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_id' },
      operator: { options: expect.any(Array), current: OPERATORS.NOT_IN },
      value: { current: 'value, value2' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'user_id' },
      operator: { options: expect.any(Array), current: OPERATORS.IN },
      value: { current: 'value, value2' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'department_names', dataType: DATA_TYPES.ArrayType },
      operator: { options: expect.any(Array), current: OPERATORS.CONTAINS_ALL },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'department_names', dataType: DATA_TYPES.ArrayType },
      operator: { options: expect.any(Array), current: OPERATORS.NOT_CONTAINS_ALL },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'department_names', dataType: DATA_TYPES.ArrayType },
      operator: { options: expect.any(Array), current: OPERATORS.CONTAINS_ANY },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'department_names', dataType: DATA_TYPES.ArrayType },
      operator: { options: expect.any(Array), current: OPERATORS.NOT_CONTAINS_ANY },
      value: { current: 'value' },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'department_ids', dataType: DATA_TYPES.ArrayType },
      operator: { options: expect.any(Array), current: OPERATORS.EMPTY },
      value: { current: true },
    },
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'department_ids', dataType: DATA_TYPES.ArrayType },
      operator: { options: expect.any(Array), current: OPERATORS.EMPTY },
      value: { current: false },
    },
  ];

  const sourceFromUI = [
    ...source,
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'instance.languages' },
      operator: { options: expect.any(Array), current: OPERATORS.IN },
      value: { current: [{ label: 'value', value: 'value' }, { label: 'value2', value: 'value2' }] },
    },
  ];

  const sourceFromBE = [
    ...source,
    {
      boolean: { options: booleanOptions, current: '$and' },
      field: { options: fieldOptions, current: 'instance.languages' },
      operator: { options: expect.any(Array), current: OPERATORS.IN },
      value: { current: ['value', 'value2'] },
    },
  ];

  const initialValues = {
    $and: [
      { user_first_name: { $eq: 'value' } },
      { user_first_name: { $ne: 'value' } },
      { user_last_name: { $gt: 'value' } },
      { user_last_name: { $lt: 10 } },
      { user_last_name: { $gte: 'value' } },
      { user_full_name: { $regex: 'abc' } },
      { user_id: { $nin: ['value', 'value2'] } },
      { user_id: { $in: ['value', 'value2'] } },
      { department_names: { $contains_all: ['value'] } },
      { department_names: { $not_contains_all: ['value'] } },
      { department_names: { $contains_any: ['value'] } },
      { department_names: { $not_contains_any: ['value'] } },
      { department_ids: { $empty: true } },
      { department_ids: { $empty: false } },
      { 'instance.languages': { $in: ['value', 'value2'] } },
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

      if (typeof currentValue === 'string' && [
        OPERATORS.IN,
        OPERATORS.NOT_IN,
        OPERATORS.CONTAINS_ALL,
        OPERATORS.NOT_CONTAINS_ALL,
        OPERATORS.CONTAINS_ANY,
        OPERATORS.NOT_CONTAINS_ANY,
      ].includes(currentOperator)) {
        return currentValue.split(',').map(item => item.trim());
      }

      return Array.isArray(currentValue) ? currentValue.map(({ value }) => value) : currentValue;
    };

    expect(result).toEqual(sourceFromBE.map(v => ({
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

  it('should convert single query without operators to source format', async () => {
    const result = await mongoQueryToSource({
      initialValues: { user_first_name: { $eq: 'value' } },
      booleanOptions: [{ label: 'AND', value: '' }],
      fieldOptions,
      intl: { formatMessage: jest.fn() },
    });

    expect(result).toEqual(singleSource);
  });

  it('should convert from source to simple query format', () => {
    const result = sourceToMongoQuery(sourceFromUI);

    expect(result).toEqual(initialValues);
  });

  it('should convert from SINGLE source to simple query format', () => {
    const initial = { user_first_name: { $eq: 'value' } };

    const result = sourceToMongoQuery(singleSource);

    expect(result).toEqual(initial);
  });

  it('should handle case when queried field is deleted', async () => {
    const initialValuesUpdated = {
      $and: [
        { user_first_name: { $eq: 'value' } },
        { delegate_languages: { $empty: true } },
      ],
    };

    const defaultField = fieldOptions[0];

    const result = await mongoQueryToSource({
      initialValues: initialValuesUpdated,
      booleanOptions,
      fieldOptions,
      intl: { formatMessage: jest.fn() },
      getParamsSource: jest.fn(),
    });

    expect(result).toEqual([
      {
        boolean: { options: booleanOptions, current: '$and' },
        field: {
          options: fieldOptions,
          current: 'user_first_name',
          dataType: 'stringType',
        },
        operator: {
          dataType: 'stringType',
          options: expect.any(Array),
          current: '==',
        },
        value: { current: 'value', source: undefined, options: undefined },
      },
      {
        boolean: { options: booleanOptions, current: '$and' },
        field: {
          options: fieldOptions,
          current: 'delegate_languages',
          dataType: defaultField?.dataType,
        },
        operator: {
          dataType: defaultField?.dataType,
          options: expect.any(Array),
          current: '',
        },
        value: {
          current: '',
          source: defaultField?.source,
          options: defaultField?.values,
        },
      },
    ]);
  });
});

describe('isQueryValid', () => {
  it('returns true when all items in the source array are valid', () => {
    const src = [
      {
        [COLUMN_KEYS.FIELD]: { current: 'field1' },
        [COLUMN_KEYS.OPERATOR]: { current: '>' },
        [COLUMN_KEYS.VALUE]: { current: 10 },
      },
      {
        [COLUMN_KEYS.FIELD]: { current: 'field2' },
        [COLUMN_KEYS.OPERATOR]: { current: '==' },
        [COLUMN_KEYS.VALUE]: { current: true },
      },
    ];

    expect(isQueryValid(src)).toBe(true);
  });

  it('returns false if any item in the source array is invalid', () => {
    const src = [
      {
        [COLUMN_KEYS.FIELD]: { current: 'field1' },
        [COLUMN_KEYS.OPERATOR]: { current: '>' },
        [COLUMN_KEYS.VALUE]: { current: null },
      },
      {
        [COLUMN_KEYS.FIELD]: { current: 'field2' },
        [COLUMN_KEYS.OPERATOR]: { current: '==' },
        [COLUMN_KEYS.VALUE]: { current: undefined },
      },
    ];

    expect(isQueryValid(src)).toBe(false);
  });

  it('returns false if source is empty', () => {
    const src = [];

    expect(isQueryValid(src)).toBe(false);
  });

  it('returns true if values in the source array are arrays and not empty', () => {
    const src = [
      {
        [COLUMN_KEYS.FIELD]: { current: 'field1' },
        [COLUMN_KEYS.OPERATOR]: { current: '>' },
        [COLUMN_KEYS.VALUE]: { current: [1, 2, 3] },
      },
    ];

    expect(isQueryValid(src)).toBe(true);
  });

  it('returns true if values in the source array are boolean', () => {
    const src = [
      {
        [COLUMN_KEYS.FIELD]: { current: 'field1' },
        [COLUMN_KEYS.OPERATOR]: { current: '>' },
        [COLUMN_KEYS.VALUE]: { current: true },
      },
    ];

    expect(isQueryValid(src)).toBe(true);
  });

  it('returns true if values in the source array are truthy', () => {
    const src = [
      {
        [COLUMN_KEYS.FIELD]: { current: 'field1' },
        [COLUMN_KEYS.OPERATOR]: { current: '>' },
        [COLUMN_KEYS.VALUE]: { current: 'some value' },
      },
    ];

    expect(isQueryValid(src)).toBe(true);
  });
});

describe('getTransformedValue', () => {
  it.each([
    [undefined, undefined],
    ['a', ['a']],
    ['a ', ['a']],
    [' a ', ['a']],
    [' a , b   ', ['a', 'b']],
    [[], []],
    [['a', 'b'], ['a', 'b']],
    [[{ value: 'a' }, { value: 'b' }], ['a', 'b']],
    [[{ value: 'a' }, { value: 'b' }, 'c'], ['a', 'b', 'c']],
    [[undefined, { value: 'b' }, 'c'], [undefined, 'b', 'c']],
  ])('transforms %s to %s', (val, expected) => {
    const actual = getTransformedValue(val);

    expect(actual).toEqual(expected);
  });
});

describe('findMissingValues', () => {
  it('should return missing values from secondaryArray that are not in mainArray', () => {
    const mainArray = [
      { value: 'value1' },
      { value: 'value2' },
      { value: 'value3' },
    ];

    const secondaryArray = [
      { field: { current: 'value2' } },
      { field: { current: 'value4' } },
      { field: { current: 'value5' } },
    ];

    const result = findMissingValues(mainArray, secondaryArray);

    expect(result).toEqual(['value4', 'value5']);
  });

  it('should return an empty array when all values are present in mainArray', () => {
    const mainArray = [
      { value: 'value1' },
      { value: 'value2' },
    ];

    const secondaryArray = [
      { field: { current: 'value1' } },
      { field: { current: 'value2' } },
    ];

    const result = findMissingValues(mainArray, secondaryArray);

    expect(result).toEqual([]);
  });

  it('should handle cases where mainArray is empty', () => {
    const mainArray = [];

    const secondaryArray = [
      { field: { current: 'value1' } },
      { field: { current: 'value2' } },
    ];

    const result = findMissingValues(mainArray, secondaryArray);

    expect(result).toEqual(['value1', 'value2']);
  });

  it('should handle cases where secondaryArray is empty', () => {
    const mainArray = [
      { value: 'value1' },
      { value: 'value2' },
    ];

    const secondaryArray = [];

    const result = findMissingValues(mainArray, secondaryArray);

    expect(result).toEqual([]);
  });

  it('should handle cases where both arrays are empty', () => {
    const mainArray = [];
    const secondaryArray = [];

    const result = findMissingValues(mainArray, secondaryArray);

    expect(result).toEqual([]);
  });

  it('should ignore null or undefined values in secondaryArray', () => {
    const mainArray = [
      { value: 'value1' },
      { value: 'value2' },
    ];

    const secondaryArray = [
      { field: { current: 'value3' } },
      { field: { current: null } },
      { field: { current: undefined } },
    ];

    const result = findMissingValues(mainArray, secondaryArray);

    expect(result).toEqual(['value3']);
  });
});
