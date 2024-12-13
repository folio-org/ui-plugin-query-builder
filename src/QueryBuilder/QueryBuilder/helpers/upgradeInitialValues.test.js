import upgradeInitialValues from './upgradeInitialValues';

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
