import upgradeInitialValues, { filterByEntityColumns } from './upgradeInitialValues';

describe('initial values legacy conversion', () => {
  const ENTITY_TYPE = { columns: [{ name: 'foo', idColumnName: 'idColumn' }] };

  it.each([
    [null, null],
    [null, undefined],
    [undefined, null],
    [undefined, undefined],
    [null, {}],
    [undefined, {}],
    [{ _version: '1' }, null],
    [{ _version: '1' }, undefined],
    [{ _version: '1' }, null],
    [{ _version: '1' }, undefined],
    [{ _version: '1' }, {}],
  ])('considers initialValues=%s and entityType=%s as a new query', (initialValues, entityType) => {
    expect(upgradeInitialValues(initialValues, entityType)).toStrictEqual(undefined);
  });

  it.each([{ foo: '' }, { bar: '' }, { foo: '', bar: '' }])(
    'processes but does not convert non-id columns in %s',
    (values) => {
      expect(upgradeInitialValues(values, ENTITY_TYPE)).toStrictEqual(values);
      // indicates that processing was actually done
      expect(upgradeInitialValues(values, ENTITY_TYPE)).not.toBe(values);
    },
  );

  it.each([
    [{ _version: '1', foo: '' }, { foo: '' }],
    [{ _version: '1', idColumn: '' }, { foo: '' }],
    [
      { idColumn: '', bar: '' },
      { foo: '', bar: '' },
    ],
  ])('converts %s to %s', (input, expected) => {
    expect(upgradeInitialValues(input, ENTITY_TYPE)).toStrictEqual(expected);
  });
});

describe('filterByEntityColumns', () => {
  const sampleColumns = [
    { name: 'field1' },
    { name: 'fieldA' },
  ];
  const entityTypes = { columns: sampleColumns };

  test('returns original object when there is no array property', () => {
    const input = { foo: 123, bar: 'abc' };
    const result = filterByEntityColumns(input, entityTypes);

    expect(result).toBe(input);
  });

  test('filters out entries whose keys are not in entityTypes.columns', () => {
    const initialValues = {
      $end: [
        { field1: { $empty: false } },
        { field2: { $empty: false } },
        { fieldA: { value: 42 } },
      ],
      otherProp: true,
    };

    const expected = {
      $end: [
        { field1: { $empty: false } },
        { fieldA: { value: 42 } },
      ],
      otherProp: true,
    };

    const result = filterByEntityColumns(initialValues, entityTypes);

    expect(result).toEqual(expected);
  });

  test('handles dynamic array property names', () => {
    const initialValues = {
      $end: [
        { fieldA: { foo: 'bar' } },
        { unknownField: { foo: 'baz' } },
      ],
      another: 5,
    };
    const expected = {
      $end: [
        { fieldA: { foo: 'bar' } },
      ],
      another: 5,
    };

    const result = filterByEntityColumns(initialValues, { columns: [{ name: 'fieldA' }] });

    expect(result).toEqual(expected);
  });

  test('returns identical array if all keys match', () => {
    const initialValues = {
      $end: [
        { fieldA: {} },
      ],
    };

    const result = filterByEntityColumns(initialValues, { columns: [{ name: 'fieldA' }] });

    expect(result).toEqual(initialValues);
  });

  test('filters when first array exists among multiple arrays', () => {
    const initialValues = {
      firstArr: [{ fieldA: {} }, { unknown: {} }],
      secondArr: [{ field1: {} }],
    };
    const expected = {
      firstArr: [{ fieldA: {} }],
      secondArr: [{ field1: {} }],
    };

    const result = filterByEntityColumns(initialValues, entityTypes);

    expect(result).toEqual(expected);
  });

  test('handles empty array property gracefully', () => {
    const initialValues = { list: [] };
    const result = filterByEntityColumns(initialValues, entityTypes);

    expect(result).toEqual({ list: [] });
  });
});
