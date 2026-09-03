import {
  findMissingValues,
  getQueryStr,
  getTransformedValue,
  isQueryValid,
  fqlQueryToSource,
  sourceToFqlQuery,
} from './query';
import { booleanOptions } from './selectOptions';
import { OPERATORS } from '../../../constants/operators';
import { fieldOptions } from '../../../../test/jest/data/entityType';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { COLUMN_KEYS } from '../../../constants/columnKeys';
import { DATA_OPTIONS_LOAD_FAILED } from '../../../hooks/useDataOptions';

describe('fqlQueryToSource()', () => {
  it('should return empty array for empty query', async () => {
    const result = await fqlQueryToSource({
      initialValues: {},
      booleanOptions,
      fieldOptions,
      intl: { formatMessage: jest.fn() },
      getParamsSource: jest.fn(),
    });

    expect(result).toEqual([]);
  });

  it('round-trips a MARC subfield field (not in fieldOptions) into a MARC-mode row', async () => {
    const result = await fqlQueryToSource({
      initialValues: { marc_245_ind1_1_a: { $eq: 'Shakespeare' } },
      fieldOptions,
      intl: { formatMessage: jest.fn() },
      getParamsSource: jest.fn(),
    });

    expect(result).toHaveLength(1);
    expect(result[0].field).toMatchObject({
      current: 'marc_245_ind1_1_a',
      isMarc: true,
      dataType: DATA_TYPES.StringType,
    });
    expect(result[0].operator.current).toBe(OPERATORS.EQUAL);
    expect(result[0].operator.options).toEqual(expect.any(Array));
    expect(result[0].value.current).toBe('Shakespeare');
    // Subfield target stays free-text: no enumerated value options.
    expect(result[0].value.options).toBeUndefined();
  });

  // The simplified UI doesn't build indicator-target fields, but a saved/API-created one still loads in MARC mode
  // with the indicator operator set and a free-text value (no enumerated options).
  it('round-trips a saved indicator-target field in MARC mode with a free-text value', async () => {
    const result = await fqlQueryToSource({
      initialValues: { marc_245_ind1_1_ind2: { $in: ['0', '4'] } },
      fieldOptions,
      intl: { formatMessage: jest.fn() },
      getParamsSource: jest.fn(),
    });

    expect(result[0].field).toMatchObject({ current: 'marc_245_ind1_1_ind2', isMarc: true });
    expect(result[0].operator.current).toBe(OPERATORS.IN);
    expect(result[0].operator.options.map((option) => option.value)).not.toContain(OPERATORS.CONTAINS);
    expect(result[0].value.options).toBeUndefined();
    expect(result[0].value.current).toEqual(['0', '4']);
  });

  const singleSource = [{
    boolean: { options: [{ label: 'AND', value: '$and' }], current: '' },
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
      field: { options: fieldOptions, current: 'user_full_name' },
      operator: { options: expect.any(Array), current: OPERATORS.STARTS_WITH },
      value: { current: 'Jeff' },
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
      value: { current: [{ value: 'value', label: 'value' }, { value: 'value2', label: 'value2' }] },
    },
  ];

  const initialValues = {
    $and: [
      { user_first_name: { $eq: 'value' } },
      { user_first_name: { $ne: 'value' } },
      { user_last_name: { $gt: 'value' } },
      { user_last_name: { $lt: 10 } },
      { user_last_name: { $gte: 'value' } },
      { user_full_name: { $contains: 'abc' } },
      { user_full_name: { $starts_with: 'Jeff' } },
      { user_id: { $nin: ['value', 'value2'] } },
      { user_id: { $in: ['value', 'value2'] } },
      { department_ids: { $empty: true } },
      { department_ids: { $empty: false } },
      { 'instance.languages': { $in: ['value', 'value2'] } },
    ],
  };

  it('should convert simple query to source format', async () => {
    const result = await fqlQueryToSource({
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
      ].includes(currentOperator)) {
        return currentValue.split(',').map(item => item.trim());
      }

      return currentValue;
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
    const result = await fqlQueryToSource({
      initialValues: { user_first_name: { $eq: 'value' } },
      booleanOptions: [{ label: 'AND', value: '' }],
      fieldOptions,
      intl: { formatMessage: jest.fn() },
    });

    expect(result).toEqual(singleSource);
  });

  it('should convert from source to simple query format', () => {
    const result = sourceToFqlQuery(sourceFromUI);

    expect(result).toEqual(initialValues);
  });

  it('should convert from SINGLE source to simple query format', () => {
    const initial = { user_first_name: { $eq: 'value' } };

    const result = sourceToFqlQuery(singleSource);

    expect(result).toEqual(initial);
  });

  it('should handle case when queried field is deleted', async () => {
    const initialValuesUpdated = {
      $and: [
        { user_first_name: { $eq: 'value' } },
        { delegate_languages: { $empty: true } },
      ],
    };

    const result = await fqlQueryToSource({
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
    ]);
  });

  it('should fetch possible values when field has a source and format value using fetched labels', async () => {
    const intl = { formatMessage: jest.fn() };
    const getDataOptionsWithFetching = jest.fn(() => Promise.resolve([
      { value: 'value1', label: 'Label 1' },
      { value: 'value2', label: 'Label 2' },
    ]));

    const fieldOptionsWithSource = [{
      value: 'user_first_name',
      label: 'User first name',
      dataType: DATA_TYPES.StringType,
      source: { name: 'non-org', columnName: 'user_first_name' },
    }];

    const initialValuesWithSource = {
      user_first_name: { $in: ['value1', 'value2'] },
    };

    const result = await fqlQueryToSource({
      initialValues: initialValuesWithSource,
      fieldOptions: fieldOptionsWithSource,
      intl,
      getDataOptionsWithFetching,
      preserveQueryValue: false,
      originalEntityTypeId: 'entity-type-id',
    });

    expect(getDataOptionsWithFetching).toHaveBeenCalledWith(
      'user_first_name',
      fieldOptionsWithSource[0].source,
      '',
      ['value1', 'value2'],
      'entity-type-id',
      undefined,
    );

    expect(result).toEqual([
      {
        boolean: { options: booleanOptions, current: '' },
        field: { options: fieldOptionsWithSource, current: 'user_first_name', dataType: DATA_TYPES.StringType },
        operator: { options: expect.any(Array), current: OPERATORS.IN, dataType: DATA_TYPES.StringType },
        value: {
          current: [
            { value: 'value1', label: 'Label 1' },
            { value: 'value2', label: 'Label 2' },
          ],
          source: fieldOptionsWithSource[0].source,
          options: undefined,
        },
      },
    ]);
  });

  it('should fetch possible values when field has valueSourceApi and no source', async () => {
    const intl = { formatMessage: jest.fn() };
    const valueSourceApi = { path: '/value-source-api' };
    const getDataOptionsWithFetching = jest.fn(() => Promise.resolve([
      { value: 'value1', label: 'Label 1' },
      { value: 'value2', label: 'Label 2' },
    ]));

    const fieldOptionsWithValueSourceApi = [{
      value: 'user_first_name',
      label: 'User first name',
      dataType: DATA_TYPES.StringType,
      valueSourceApi,
    }];

    const initialValuesWithValueSourceApi = {
      user_first_name: { $in: ['value1', 'value2'] },
    };

    const result = await fqlQueryToSource({
      initialValues: initialValuesWithValueSourceApi,
      fieldOptions: fieldOptionsWithValueSourceApi,
      intl,
      getDataOptionsWithFetching,
      preserveQueryValue: false,
      originalEntityTypeId: 'entity-type-id',
    });

    expect(getDataOptionsWithFetching).toHaveBeenCalledWith(
      'user_first_name',
      undefined,
      '',
      ['value1', 'value2'],
      'entity-type-id',
      valueSourceApi,
    );

    expect(result).toEqual([
      {
        boolean: { options: booleanOptions, current: '' },
        field: { options: fieldOptionsWithValueSourceApi, current: 'user_first_name', dataType: DATA_TYPES.StringType },
        operator: { options: expect.any(Array), current: OPERATORS.IN, dataType: DATA_TYPES.StringType },
        value: {
          current: [
            { value: 'value1', label: 'Label 1' },
            { value: 'value2', label: 'Label 2' },
          ],
          source: undefined,
          valueSourceApi,
          options: undefined,
        },
      },
    ]);
  });

  it('should preserve query value when valueSourceApi possible values fail to load', async () => {
    const intl = { formatMessage: jest.fn() };
    const valueSourceApi = { path: '/value-source-api' };
    const getDataOptionsWithFetching = jest.fn(() => Promise.resolve(DATA_OPTIONS_LOAD_FAILED));

    const fieldOptionsWithValueSourceApi = [{
      value: 'user_first_name',
      label: 'User first name',
      dataType: DATA_TYPES.StringType,
      valueSourceApi,
    }];

    const initialValuesWithValueSourceApi = {
      user_first_name: { $in: ['value1', 'value2'] },
    };

    const result = await fqlQueryToSource({
      initialValues: initialValuesWithValueSourceApi,
      fieldOptions: fieldOptionsWithValueSourceApi,
      intl,
      getDataOptionsWithFetching,
      preserveQueryValue: false,
      originalEntityTypeId: 'entity-type-id',
    });

    expect(result[0].value).toEqual({
      current: ['value1', 'value2'],
      source: undefined,
      valueSourceApi,
      options: undefined,
    });
  });

  it('should preserve query value when preserveQueryValue is true', async () => {
    const intl = { formatMessage: jest.fn() };
    const getDataOptionsWithFetching = jest.fn(() => Promise.resolve([
      { value: 'value1', label: 'Label 1' },
      { value: 'value2', label: 'Label 2' },
    ]));

    const fieldOptionsWithSource = [{
      value: 'user_first_name',
      label: 'User first name',
      dataType: DATA_TYPES.StringType,
      source: { name: 'non-org', columnName: 'user_first_name' },
    }];

    const initialValuesWithSource = {
      user_first_name: { $eq: 'value1' },
    };

    const result = await fqlQueryToSource({
      initialValues: initialValuesWithSource,
      fieldOptions: fieldOptionsWithSource,
      intl,
      getDataOptionsWithFetching,
      preserveQueryValue: true,
      originalEntityTypeId: 'entity-type-id',
    });

    expect(result).toEqual([
      {
        boolean: { options: booleanOptions, current: '' },
        field: { options: fieldOptionsWithSource, current: 'user_first_name', dataType: DATA_TYPES.StringType },
        operator: { options: expect.any(Array), current: OPERATORS.EQUAL, dataType: DATA_TYPES.StringType },
        value: {
          current: 'value1',
          source: fieldOptionsWithSource[0].source,
          options: undefined,
        },
      },
    ]);
  });

  it('should show labels for array fields with predefined values when editing query', async () => {
    const intl = { formatMessage: jest.fn() };

    const initial = {
      'instance.languages': { $in: ['eng', 'fra'] },
    };

    const result = await fqlQueryToSource({
      initialValues: initial,
      fieldOptions,
      intl,
      getDataOptionsWithFetching: jest.fn(),
      preserveQueryValue: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0].field.current).toBe('instance.languages');
    expect(result[0].operator.current).toBe(OPERATORS.IN);
    expect(result[0].value.current).toEqual([
      { value: 'eng', label: 'English' },
      { value: 'fra', label: 'French' },
    ]);
  });

  it('should show labels for array fields with source when editing query', async () => {
    const intl = { formatMessage: jest.fn() };
    const getDataOptionsWithFetching = jest.fn(() => Promise.resolve([
      { value: 'uuid-1', label: 'Department A' },
      { value: 'uuid-2', label: 'Department B' },
    ]));

    const fieldOptionsWithSource = [{
      value: 'departments',
      label: 'Departments',
      dataType: DATA_TYPES.JsonbArrayType,
      source: {
        columnName: 'name',
        entityTypeId: 'f067beda-cbeb-4423-9a0d-3b59fb329ce2',
      },
    }];

    const initial = {
      departments: { $in: ['uuid-1', 'uuid-2'] },
    };

    const result = await fqlQueryToSource({
      initialValues: initial,
      fieldOptions: fieldOptionsWithSource,
      intl,
      getDataOptionsWithFetching,
      preserveQueryValue: true,
      originalEntityTypeId: 'entity-type-id',
    });

    expect(getDataOptionsWithFetching).toHaveBeenCalledWith(
      'departments',
      fieldOptionsWithSource[0].source,
      '',
      ['uuid-1', 'uuid-2'],
      'entity-type-id',
      undefined,
    );

    expect(result).toHaveLength(1);
    expect(result[0].field.current).toBe('departments');
    expect(result[0].operator.current).toBe(OPERATORS.IN);
    expect(result[0].value.current).toEqual([
      { value: 'uuid-1', label: 'Department A' },
      { value: 'uuid-2', label: 'Department B' },
    ]);
  });

  it('should filter out items with unsupported operators', async () => {
    const intl = { formatMessage: jest.fn() };

    const initialValuesWithUnsupportedOperator = {
      $and: [
        { user_first_name: { $eq: 'value' } },
        { user_last_name: { $unsupported_operator: 'value' } },
        { user_full_name: { $contains: 'test' } },
      ],
    };

    const result = await fqlQueryToSource({
      initialValues: initialValuesWithUnsupportedOperator,
      fieldOptions,
      intl,
      getDataOptionsWithFetching: jest.fn(),
    });

    // The unsupported operator should be filtered out (returns null, gets filtered)
    // This prevents UI crashes when trying to render null rows
    expect(result).toHaveLength(2);
    expect(result[0].field.current).toBe('user_first_name');
    expect(result[0].operator.current).toBe(OPERATORS.EQUAL);
    expect(result[1].field.current).toBe('user_full_name');
    expect(result[1].operator.current).toBe(OPERATORS.CONTAINS);
  });

  it('should not fetch source values for the is null/empty operator (avoids infinite refetch loop)', async () => {
    const intl = { formatMessage: jest.fn() };
    const getDataOptionsWithFetching = jest.fn(() => Promise.resolve([]));

    const fieldOptionsWithOrgSource = [{
      value: 'donor_organizations',
      label: 'Donor organizations',
      dataType: DATA_TYPES.StringType,
      source: { name: 'donor_organization', columnName: 'name' },
    }];

    const initialValuesWithEmpty = {
      donor_organizations: { $empty: true },
    };

    const result = await fqlQueryToSource({
      initialValues: initialValuesWithEmpty,
      fieldOptions: fieldOptionsWithOrgSource,
      intl,
      getDataOptionsWithFetching,
      preserveQueryValue: false,
      originalEntityTypeId: 'entity-type-id',
    });

    expect(getDataOptionsWithFetching).not.toHaveBeenCalled();
    expect(result[0].operator.current).toBe(OPERATORS.EMPTY);
    expect(result[0].value.current).toBe(true);
  });
});

describe('getQueryStr', () => {
  it('uses static option labels for single-value custom field values', () => {
    const customFieldOptions = [
      {
        value: 'source._custom_field_123',
        label: 'Custom field',
        dataType: DATA_TYPES.StringType,
        values: [
          { value: 'opt_1', label: 'Option 1' },
          { value: 'opt_2', label: 'Option 2' },
        ],
      },
    ];
    const rows = [
      {
        boolean: { current: '' },
        field: {
          options: customFieldOptions,
          current: 'source._custom_field_123',
        },
        operator: { current: OPERATORS.EQUAL },
        value: {
          current: 'opt_1',
          options: customFieldOptions[0].values,
        },
      },
    ];

    const result = getQueryStr(
      rows,
      customFieldOptions,
      { formatDate: jest.fn(), formatMessage: jest.fn(({ id }) => (id.endsWith('.EQUAL') ? '==' : id)) },
      'UTC',
      jest.fn(() => []),
    );

    expect(result).toBe('(Custom field == Option 1)');
  });

  it('uses async option labels for single-value source field values', () => {
    const sourceFieldOptions = [
      {
        value: 'field1',
        label: 'Field 1',
        dataType: DATA_TYPES.StringType,
      },
    ];
    const rows = [
      {
        boolean: { current: '' },
        field: {
          options: sourceFieldOptions,
          current: 'field1',
        },
        operator: { current: OPERATORS.EQUAL },
        value: {
          current: 'value 1',
        },
      },
    ];

    const result = getQueryStr(
      rows,
      sourceFieldOptions,
      { formatDate: jest.fn(), formatMessage: jest.fn(({ id }) => (id.endsWith('.EQUAL') ? '==' : id)) },
      'UTC',
      jest.fn(() => [{ value: 'value 1', label: 'Label 1' }]),
    );

    expect(result).toBe('(field1 == Label 1)');
  });

  it('localizes a boolean field value instead of using the server-provided label', () => {
    const options = [{ value: 'user_active', label: 'User active', dataType: DATA_TYPES.BooleanType }];
    const valueOptions = [{ value: 'true', label: 'True (server)' }, { value: 'false', label: 'False (server)' }];
    const formatMessage = jest.fn(({ id }) => {
      if (id.endsWith('.symbol.EQUAL')) return '==';
      if (id.endsWith('.options.true')) return 'localizedTrue';

      return id;
    });
    const run = (current) => getQueryStr(
      [{
        boolean: { current: '' },
        field: { options, current: 'user_active' },
        operator: { current: OPERATORS.EQUAL },
        value: { current, options: valueOptions },
      }],
      options,
      { formatDate: jest.fn(), formatMessage },
      'UTC',
      jest.fn(() => []),
    );

    // live-rows path (string value), and saved-query path (server label) both localize
    expect(run('true')).toBe('(user_active == localizedTrue)');
    expect(run(true)).toBe('(user_active == localizedTrue)');
    expect(run('True (server)')).toBe('(user_active == localizedTrue)');
  });

  it('coerces a boolean value with no matching options via the fallback path', () => {
    const options = [{ value: 'user_active', label: 'User active', dataType: DATA_TYPES.BooleanType }];
    const formatMessage = jest.fn(({ id }) => {
      if (id.endsWith('.symbol.EQUAL')) return '==';
      if (id.endsWith('.options.true')) return 'localizedTrue';

      return id;
    });
    const result = getQueryStr(
      [{
        boolean: { current: '' },
        field: { options, current: 'user_active' },
        operator: { current: OPERATORS.EQUAL },
        // no value.options -> normalizeBooleanValue finds no match and coerces the raw value
        value: { current: true },
      }],
      options,
      { formatDate: jest.fn(), formatMessage },
      'UTC',
      jest.fn(() => []),
    );

    expect(result).toBe('(user_active == localizedTrue)');
  });

  it('passes an empty boolean value through unchanged (not coerced to false)', () => {
    const options = [{ value: 'user_active', label: 'User active', dataType: DATA_TYPES.BooleanType }];
    const formatMessage = jest.fn(({ id }) => (id.endsWith('.symbol.EQUAL') ? '==' : id));
    const result = getQueryStr(
      [{
        boolean: { current: '' },
        field: { options, current: 'user_active' },
        operator: { current: OPERATORS.EQUAL },
        // empty value -> early return keeps it '' rather than coercing to false/localizing
        value: { current: '' },
      }],
      options,
      { formatDate: jest.fn(), formatMessage },
      'UTC',
      jest.fn(() => []),
    );

    expect(result).toBe('(user_active == )');
  });

  it('uses the friendly MARC label for a MARC field instead of the raw field name', () => {
    const rows = [
      {
        boolean: { current: '' },
        field: { options: [], current: 'marc_bib.marc_245_a', isMarc: true },
        operator: { current: OPERATORS.EQUAL },
        value: { current: 'Hamlet' },
      },
    ];

    const result = getQueryStr(
      rows,
      [],
      { formatDate: jest.fn(), formatMessage: jest.fn(({ id }) => (id.endsWith('.EQUAL') ? '==' : id)) },
      'UTC',
      jest.fn(() => []),
    );

    expect(result).toContain('MARC 245$a');
    expect(result).not.toContain('marc_bib.marc_245_a');
  });

  it.each([
    ['no field or operator (value only)', { field: '', operator: '', value: 'Ksdlfasdvna' }],
    ['a field but no operator yet', { field: 'marc_bib.marc_245_a', operator: '', value: 'Ksdlfasdvna' }],
  ])('renders nothing for an incomplete condition: %s', (_desc, { field, operator, value }) => {
    const rows = [
      {
        boolean: { current: '' },
        field: { options: [], current: field, isMarc: true },
        operator: { current: operator },
        value: { current: value },
      },
    ];

    const result = getQueryStr(
      rows,
      [],
      { formatDate: jest.fn(), formatMessage: jest.fn(({ id }) => id) },
      'UTC',
      jest.fn(() => []),
    );

    expect(result).toBe('');
  });

  it('keeps complete conditions and skips an incomplete one in a multi-row query', () => {
    const options = [{ value: 'field1', label: 'Field 1', dataType: DATA_TYPES.StringType }];
    const rows = [
      {
        boolean: { current: '' },
        field: { options, current: 'field1' },
        operator: { current: OPERATORS.EQUAL },
        value: { current: 'a' },
      },
      {
        // second row still being built — no operator yet
        boolean: { current: '$and' },
        field: { options: [], current: 'marc_bib.marc_245_a', isMarc: true },
        operator: { current: '' },
        value: { current: 'b' },
      },
    ];

    const result = getQueryStr(
      rows,
      options,
      { formatDate: jest.fn(), formatMessage: jest.fn(({ id }) => (id.endsWith('.EQUAL') ? '==' : id)) },
      'UTC',
      jest.fn(() => []),
    );

    expect(result).toBe('(field1 == a)');
  });

  describe('direction independence', () => {
    // The query is built in logical order regardless of direction; RTL display
    // is left to the browser's native bidi algorithm, so the string is identical
    // in LTR and RTL and never contains directional control characters.
    const formatMessage = jest.fn(({ id }) => {
      if (id.endsWith('.symbol.EQUAL')) return '==';
      if (id.endsWith('.boolean.$and')) return 'AND';

      return id;
    });

    const options = [
      { value: 'field1', label: 'Field 1', dataType: DATA_TYPES.StringType },
      { value: 'field2', label: 'Field 2', dataType: DATA_TYPES.StringType },
    ];
    const rows = [
      {
        boolean: { current: '' },
        field: { options, current: 'field1' },
        operator: { current: OPERATORS.EQUAL },
        value: { current: 'a' },
      },
      {
        boolean: { current: '$and' },
        field: { options, current: 'field2' },
        operator: { current: OPERATORS.EQUAL },
        value: { current: 'b' },
      },
    ];
    const args = [options, { formatDate: jest.fn(), formatMessage }, 'UTC', jest.fn(() => [])];
    const expected = '(field1 == a) AND (field2 == b)';

    afterEach(() => {
      document.dir = '';
      formatMessage.mockClear();
    });

    it('builds clauses in logical order in LTR', () => {
      document.dir = 'ltr';

      expect(getQueryStr(rows, ...args)).toBe(expected);
    });

    it('produces the same logical-order string in RTL (no mirroring, no isolates)', () => {
      document.dir = 'rtl';

      const result = getQueryStr(rows, ...args);
      const isolateRange = new RegExp(`[${String.fromCodePoint(0x2066)}-${String.fromCodePoint(0x2069)}]`);

      expect(result).toBe(expected);
      expect(result).not.toMatch(isolateRange);
    });
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
