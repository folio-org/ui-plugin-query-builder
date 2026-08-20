import {
  getColumnsWithProperties,
  getFieldOptions,
  getFilteredOptions,
  fuzzyOptionFormatter,
  getOperatorOptions,
} from './selectOptions';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';

// Canonical English operator labels for the dropdown, kept in sync with the
// verbose `operators.*` keys in en.json. Used here as the reference for expected
// dropdown labels (the dropdown shows words; the user-friendly query uses the
// compact `operators.symbol.*` set instead).
const OPERATORS_LABELS = {
  EQUAL: 'equals',
  NOT_EQUAL: 'not equal to',
  GREATER_THAN: 'greater than',
  LESS_THAN: 'less than',
  GREATER_THAN_OR_EQUAL: 'greater than or equal to',
  LESS_THAN_OR_EQUAL: 'less than or equal to',
  IN: 'in',
  NOT_IN: 'not in',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not contains',
  STARTS_WITH: 'starts with',
  EMPTY: 'is null/empty',
};

const getElementText = (node) => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getElementText).join('');

  return getElementText(node.props?.children);
};

const entityType = {
  columns: [
    {
      'name': 'user_full_name',
      'queryable': true,
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'User full name',
      'visibleByDefault': true,
    },
    {
      'name': 'user_active',
      'queryable': true,
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
    {
      'name': 'not_queryable',
      'queryable': false,
      'dataType': {
        'dataType': 'stringType',
      },
      'labelAlias': 'Not queryable',
      'visibleByDefault': true,
    },
  ],
};

const result = [
  {
    dataType: 'stringType',
    label: 'User full name',
    value: 'user_full_name',
    values: undefined,
  },
  {
    dataType: 'booleanType',
    label: 'User active',
    value: 'user_active',
    values: [
      { label: 'True',
        value: 'true' },
      { label: 'False',
        value: 'false' },
    ],
  },
];

describe('select options', () => {
  describe('getFieldOptions', () => {
    it('should be equal to result value', () => {
      expect(getFieldOptions(entityType?.columns)).toEqual(result);
    });

    it('uses source when valueSourceApi is not present', () => {
      const source = { name: 'organization', columnName: 'name' };

      const [field] = getFieldOptions([{
        name: 'organization_name',
        queryable: true,
        dataType: {
          dataType: 'stringType',
        },
        labelAlias: 'Organization name',
        source,
      }]);

      expect(field.source).toEqual(source);
      expect(field.valueSourceApi).toBeUndefined();
    });

    it('uses valueSourceApi when source is not present', () => {
      const valueSourceApi = { path: '/value-source-api' };

      const [field] = getFieldOptions([{
        name: 'user_full_name',
        queryable: true,
        dataType: {
          dataType: 'stringType',
        },
        labelAlias: 'User full name',
        valueSourceApi,
      }]);

      expect(field.source).toBeUndefined();
      expect(field.valueSourceApi).toEqual(valueSourceApi);
    });

    it('keeps source and valueSourceApi separate when both are present', () => {
      const source = { name: 'organization', columnName: 'name' };
      const valueSourceApi = { path: '/value-source-api' };

      const [field] = getFieldOptions([{
        name: 'organization_name',
        queryable: true,
        dataType: {
          dataType: 'stringType',
        },
        labelAlias: 'Organization name',
        source,
        valueSourceApi,
      }]);

      expect(field.source).toEqual(source);
      expect(field.valueSourceApi).toEqual(valueSourceApi);
    });
  });

  describe('getOperatorOptions', () => {
    // Operator labels now come from intl; map each operator translation id back
    // to its canonical English label so the expected arrays stay readable.
    const intlMock = {
      formatMessage: jest.fn(({ id }) => {
        const key = id.replace('ui-plugin-query-builder.operators.', '');

        return OPERATORS_LABELS[key] ?? 'label';
      }),
    };

    const expectFn = ({ options, operators }) => {
      expect(options).toEqual([
        {
          value: '',
          label: expect.stringContaining('label'),
          disabled: true,
        },
        ...operators,
      ]);

      expect(intlMock.formatMessage).toHaveBeenCalledWith({
        id: 'ui-plugin-query-builder.control.operator.placeholder',
      });
    };

    beforeEach(() => {
      intlMock.formatMessage.mockClear();
    });

    it('should return string operators with placeholder', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.StringType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.CONTAINS, value: OPERATORS.CONTAINS },
          { label: OPERATORS_LABELS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return UUID operators with placeholder for ranged UUID type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.RangedUUIDType,
        hasSourceOrValues: true,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return UUID operators with placeholder for string UUID type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.StringUUIDType,
        hasSourceOrValues: true,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return extended logical operators with placeholder for integer type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.IntegerType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
          { label: OPERATORS_LABELS.LESS_THAN, value: OPERATORS.LESS_THAN },
          { label: OPERATORS_LABELS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return extended logical operators with placeholder for number type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.NumberType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
          { label: OPERATORS_LABELS.LESS_THAN, value: OPERATORS.LESS_THAN },
          { label: OPERATORS_LABELS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return boolean operators with placeholder', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.BooleanType,
        isFromNestedField: false,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return proper array boolean operators', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.BooleanType,
        isFromNestedField: true,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return operators with placeholder for open UUID type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.OpenUUIDType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    [
      {
        dataType: DATA_TYPES.ArrayType,
        hasSourceOrValues: false,
        dynamicOperators: [
          { label: OPERATORS_LABELS.CONTAINS, value: OPERATORS.CONTAINS },
          { label: OPERATORS_LABELS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
        ],
      },
      {
        dataType: DATA_TYPES.JsonbArrayType,
        hasSourceOrValues: false,
        dynamicOperators: [
          { label: OPERATORS_LABELS.CONTAINS, value: OPERATORS.CONTAINS },
          { label: OPERATORS_LABELS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
        ],
      },
      {
        dataType: DATA_TYPES.ArrayType,
        hasSourceOrValues: true,
        dynamicOperators: [
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
        ],
      },
      {
        dataType: DATA_TYPES.JsonbArrayType,
        hasSourceOrValues: true,
        dynamicOperators: [
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
        ],
      },
    ].forEach(({ dataType, hasSourceOrValues, dynamicOperators }) => {
      it(`should return operators with placeholder for ${dataType} type and hasSourceOrValues equals "${hasSourceOrValues}"`, () => {
        const options = getOperatorOptions({
          dataType,
          hasSourceOrValues,
          intl: intlMock,
        });

        expectFn({
          options,
          operators: [
            { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
            { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
            ...dynamicOperators,
            { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
          ],
        });
      });
    });

    it('should return operators with placeholder for enum type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.EnumType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return extended logical operators with placeholder for date type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.DateType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
          { label: OPERATORS_LABELS.LESS_THAN, value: OPERATORS.LESS_THAN },
          { label: OPERATORS_LABELS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return extended logical operators with placeholder for datetime type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.DateTimeType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
          { label: OPERATORS_LABELS.LESS_THAN, value: OPERATORS.LESS_THAN },
          { label: OPERATORS_LABELS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return an empty array for unknown data type', () => {
      const options = getOperatorOptions({
        dataType: 'UnknownType',
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expect(options).toEqual([]);

      expect(intlMock.formatMessage).not.toHaveBeenCalled();
    });

    it('returns only the placeholder (no operators) for marc type when no valid fieldName is given', () => {
      // An incomplete/invalid MARC field (the control emits '') has no operators, which collapses the
      // operator and value cells until a complete field name is built.
      const options = getOperatorOptions({
        dataType: DATA_TYPES.MarcType,
        intl: intlMock,
      });

      expectFn({ options, operators: [] });
    });

    it('should return text operators with placeholder for marc type when a subfield is selected', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.MarcType,
        fieldName: 'marc_245_a',
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.CONTAINS, value: OPERATORS.CONTAINS },
          { label: OPERATORS_LABELS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return coded operators without empty, with placeholder, for marc type when an indicator is the target', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.MarcType,
        fieldName: 'marc_245_ind1',
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
        ],
      });
    });
  });
});

describe('getFieldOptions', () => {
  it('returns the expected field options', () => {
    // Mock input options
    const options = {
      columns: [
        {
          'name': 'user_full_name',
          'queryable': true,
          'dataType': {
            'dataType': 'stringType',
          },
          'labelAlias': 'User full name',
          'visibleByDefault': true,
        },
        {
          'name': 'user_active',
          'queryable': true,
          'dataType': {
            'dataType': 'stringType',
          },
          'labelAlias': 'User active',
          'visibleByDefault': true,
          'values': [
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
          ],
        },
        {
          'name': 'nested',
          'queryable': false,
          'dataType': {
            'dataType': 'objectType',
            'itemDataType': { 'properties': [
              {
                'name': 'user_field1',
                'queryable': true,
                'dataType': {
                  'dataType': 'stringType',
                },
                'labelAlias': 'User full name',
                'labelAliasFullyQualified': 'User userField1',
                'visibleByDefault': true,
              },
              {
                'name': 'user_field2',
                'queryable': true,
                'dataType': {
                  'dataType': 'stringType',
                },
                'labelAlias': 'User full name',
                'labelAliasFullyQualified': 'User userField2',
                'visibleByDefault': true,
              },
            ] },
          },
          'labelAlias': 'Nested',
          'visibleByDefault': true,
        },
      ],
    };

    const optionsResult = getFieldOptions(options.columns);

    const expectedOutput = [
      {
        'dataType': 'stringType',
        'label': 'User full name',
        'value': 'user_full_name',
      },
      {
        'dataType': 'stringType',
        'label': 'User active',
        'value': 'user_active',
        'values': [
          {
            'label': 'True',
            'value': 'true',
          },
          {
            'label': 'False',
            'value': 'false',
          },
        ],
      },
      {
        'dataType': 'stringType',
        'label': 'User userField1',
        'value': 'nested[*]->user_field1',
      },
      {
        'dataType': 'stringType',
        'label': 'User userField2',
        'value': 'nested[*]->user_field2',
      },
    ];

    expect(optionsResult).toEqual(expectedOutput);
  });
});

describe('getFilteredOptions', () => {
  const mockDataOptions = [
    { label: 'Items — Holdings — Receiving history display type' },
    { label: 'Items — Holdings — Statements' },
    { label: 'Items — Holdings — HRID' },
    { label: 'Items — Instances — Updated date' },
  ];

  it('should return options that match the input value', () => {
    const res = getFilteredOptions('Receiving', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Holdings — Receiving history display type' }]);
  });

  it('should retain special characters like em dash (—) in the input and match labels', () => {
    // The em dash (—) should be preserved, allowing this search to match.
    const res = getFilteredOptions('Instances — Updated date', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Instances — Updated date' }]);
  });

  it('should match hyphen input against em dash labels', () => {
    const res = getFilteredOptions('Parent - Child', [
      { label: 'Parent — Child' },
    ]);

    expect(res).toEqual([{ label: 'Parent — Child' }]);
  });

  it('should match em dash input against hyphen labels', () => {
    const res = getFilteredOptions('Parent — Child', [
      { label: 'Parent - Child' },
    ]);

    expect(res).toEqual([{ label: 'Parent - Child' }]);
  });

  it('should support fuzzy matching for non-contiguous input', () => {
    const res = getFilteredOptions('InstUpd', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Instances — Updated date' }]);
  });

  it('should ignore unsupported special characters in search terms', () => {
    const res = getFilteredOptions('Parent ! Child', [
      { label: 'Parent Child' },
    ]);

    expect(res).toEqual([{ label: 'Parent Child' }]);
  });

  it('should return all options containing normalized dash characters', () => {
    const res = getFilteredOptions('—', mockDataOptions);

    expect(res).toHaveLength(mockDataOptions.length);
    expect(res).toEqual(expect.arrayContaining(mockDataOptions));
  });

  it('should return all options as a new array when non-empty search only contains ignored special characters', () => {
    const res = getFilteredOptions('!*?', mockDataOptions);

    expect(res).not.toBe(mockDataOptions);
    expect(res).toEqual(mockDataOptions);
  });

  it('should match values case-insensitively', () => {
    const res = getFilteredOptions('statements', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Holdings — Statements' }]);
  });

  it('should sort equal-score matches by label', () => {
    const res = getFilteredOptions('x', [
      { label: 'Cx' },
      { label: 'Dx' },
      { label: 'Bx' },
      { label: 'Ax' },
    ]);

    expect(res.map(({ label }) => label)).toEqual(['Ax', 'Bx', 'Cx', 'Dx']);
  });

  it('should return all options if input value is an empty string', () => {
    const res = getFilteredOptions('', mockDataOptions);

    expect(res).toEqual(mockDataOptions);
  });

  it('should ignore non-string labels while filtering', () => {
    const label = <span>Formatted label</span>;
    const res = getFilteredOptions('Alpha', [
      { label },
      { label: 'Alpha' },
    ]);

    expect(res).toEqual([{ label: 'Alpha' }]);
  });

  it('should return no matches for non-string search terms', () => {
    const res = getFilteredOptions(123, [
      { label: '123' },
    ]);

    expect(res).toEqual([]);
  });

  it('should return an empty array if no options match', () => {
    const res = getFilteredOptions('no such option present', mockDataOptions);

    expect(res).toEqual([]);
  });

  it('should correctly match labels with non-Latin characters (Chinese)', () => {
    const mockDataOptionsChina = [
      { label: '項目 - 持股 - 報表' },
    ];

    const res = getFilteredOptions('持股', mockDataOptionsChina);

    expect(res).toEqual([{ label: '項目 - 持股 - 報表' }]);
  });

  it('should preserve original label dashes when highlighting normalized dash matches', () => {
    const element = fuzzyOptionFormatter({
      option: { label: 'Parent — Child' },
      searchTerm: 'Parent - Child',
    });

    expect(element.props.children[0].props.children).toBe('Parent — Child');
  });

  it('should render non-string labels without highlighting', () => {
    const label = <span>Formatted label</span>;
    const element = fuzzyOptionFormatter({
      option: { label },
      searchTerm: 'Formatted',
    });

    expect(element.props.children).toBe(label);
  });

  it('should render unhighlighted labels when the search term only contains ignored special characters', () => {
    const element = fuzzyOptionFormatter({
      option: { label: 'Alpha' },
      searchTerm: '!*?',
    });

    expect(element.props.children).toBe('Alpha');
  });

  it('should not reuse stale fuzzy indexes when formatting a shorter dash match', () => {
    fuzzyOptionFormatter({
      option: { label: 'Alpha — Beta' },
      searchTerm: 'Alpha - Beta',
    });

    const element = fuzzyOptionFormatter({
      option: { label: 'Alpha — Beta' },
      searchTerm: '-',
    });

    expect(getElementText(element)).toBe('Alpha — Beta');
  });
});

describe('getColumnsWithProperties', () => {
  it('returns empty array for empty input', () => {
    expect(getColumnsWithProperties()).toEqual([]);
    expect(getColumnsWithProperties([])).toEqual([]);
  });

  it('includes queryable columns whose name is listed as some item’s idColumnName', () => {
    const columns = [
      { name: 'meta', idColumnName: 'userId' },
      { name: 'userId', queryable: true },
      { name: 'displayName', queryable: true },
    ];

    const res = getColumnsWithProperties(columns);

    expect(res.map((i) => i.name)).toEqual(['userId', 'displayName']);
  });

  it('includes only top-level items with queryable === true', () => {
    const columns = [
      { name: 'visible', queryable: true },
      { name: 'notQueryable', queryable: false },
      { name: 'missingQueryableFlag' },
    ];

    const res = getColumnsWithProperties(columns);

    expect(res.map((i) => i.name)).toEqual(['visible']);
  });

  it('nested properties are sorted by labelAliasFullyQualified, falling back to labelAlias', () => {
    const columns = [
      {
        name: 'item',
        dataType: {
          itemDataType: {
            properties: [
              { name: 'b', queryable: true, hidden: false, labelAliasFullyQualified: 'B Key' },
              { name: 'a', queryable: true, hidden: false, labelAlias: 'A Key' },
              { name: 'd', queryable: true, hidden: false, labelAliasFullyQualified: 'D Key' },
              { name: 'c', queryable: true, hidden: false, labelAlias: 'C Key' },
            ],
          },
        },
      },
    ];

    const res = getColumnsWithProperties(columns);

    expect(res.map((i) => i.name)).toEqual(['item[*]->a', 'item[*]->b', 'item[*]->c', 'item[*]->d']);
  });

  it('does not blow up if item.dataType.itemDataType.properties is missing', () => {
    const columns = [
      { name: 'noItemDataType', queryable: true, dataType: {} },
      { name: 'noDataType', queryable: true },
    ];

    const res = getColumnsWithProperties(columns);

    expect(res.map((i) => i.name)).toEqual(['noItemDataType', 'noDataType']);
  });
});
