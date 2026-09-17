import upgradeInitialValues, { filterByEntityColumns } from './upgradeInitialValues';

describe('initial values normalization', () => {
  const ENTITY_TYPE = {
    columns: [
      { name: 'foo', idColumnName: 'idColumn', queryable: true },
      { name: 'bar', queryable: true },
      { name: 'baz', queryable: true },
      { name: 'idColumn' },
    ],
  };

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
    'processes but does not rewrite the keys in %s',
    (values) => {
      expect(upgradeInitialValues(values, ENTITY_TYPE)).toStrictEqual(values);
      // indicates that processing was actually done
      expect(upgradeInitialValues(values, ENTITY_TYPE)).not.toBe(values);
    },
  );

  it.each([
    [{ _version: '1', idColumn: '' }, {}],
    [{ idColumn: '', bar: '' }, { bar: '' }],
  ])('drops %s, which is not selectable, leaving %s', (input, expected) => {
    expect(upgradeInitialValues(input, ENTITY_TYPE)).toStrictEqual(expected);
  });
});

describe('queries on selectable id columns (UIPQB-295)', () => {
  // Mirrors the Budgets entity type: `fiscal_year.name` is the label column and
  // `fiscal_year.id` is the UUID column, which is selectable in its own right since UIPQB-282.
  const ENTITY_TYPE = {
    columns: [
      { name: 'fiscal_year.name', idColumnName: 'fiscal_year.id', queryable: true },
      { name: 'fiscal_year.id', idColumnName: null, queryable: true },
      { name: 'budget.name', queryable: true },
    ],
  };

  const UUID = 'a0c27057-c63e-41a6-ba43-8efa41101acc';

  it('leaves a single-row query on the UUID column alone', () => {
    const query = { 'fiscal_year.id': { $eq: UUID } };

    expect(upgradeInitialValues(query, ENTITY_TYPE)).toStrictEqual(query);
  });

  it('leaves a multi-row query on the UUID column alone', () => {
    const query = {
      $and: [
        { 'fiscal_year.id': { $eq: UUID } },
        { 'budget.name': { $eq: 'Alpha-FYA2024' } },
      ],
    };

    expect(upgradeInitialValues(query, ENTITY_TYPE)).toStrictEqual(query);
  });

  it('leaves a query on the label column alone', () => {
    const query = { 'fiscal_year.name': { $eq: 'FYA2024' } };

    expect(upgradeInitialValues(query, ENTITY_TYPE)).toStrictEqual(query);
  });
});

describe('filterByEntityColumns', () => {
  const sampleColumns = [
    { name: 'field1', queryable: true },
    { name: 'fieldA', queryable: true },
  ];
  const entityTypes = { columns: sampleColumns };

  test('returns original object when there is no array property', () => {
    const input = { foo: 123, bar: 'abc' };
    const result = filterByEntityColumns(input, entityTypes);

    expect(result).toEqual({});
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

    const result = filterByEntityColumns(initialValues, { columns: [{ name: 'fieldA', queryable: true }] });

    expect(result).toEqual(expected);
  });

  test('returns identical array if all keys match', () => {
    const initialValues = {
      $end: [
        { fieldA: {} },
      ],
    };

    const result = filterByEntityColumns(initialValues, { columns: [{ name: 'fieldA', queryable: true }] });

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
