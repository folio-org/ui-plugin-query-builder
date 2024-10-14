import { getFieldOptions, getFilteredOptions, getOperatorOptions } from './selectOptions';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS, OPERATORS_LABELS } from '../../../constants/operators';

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
  });

  describe('getOperatorOptions', () => {
    const intlMock = {
      formatMessage: jest.fn().mockReturnValue('label'),
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

      expect(intlMock.formatMessage).toHaveBeenCalledTimes(1);
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
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
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
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
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
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS_LABELS.IN, value: OPERATORS.IN },
          { label: OPERATORS_LABELS.NOT_IN, value: OPERATORS.NOT_IN },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
      });
    });

    it('should return operators with placeholder for array type', () => {
      const options = getOperatorOptions({
        dataType: DATA_TYPES.ArrayType,
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expectFn({
        options,
        operators: [
          { label: OPERATORS_LABELS.CONTAINS_ALL, value: OPERATORS.CONTAINS_ALL },
          { label: OPERATORS_LABELS.NOT_CONTAINS_ALL, value: OPERATORS.NOT_CONTAINS_ALL },
          { label: OPERATORS_LABELS.CONTAINS_ANY, value: OPERATORS.CONTAINS_ANY },
          { label: OPERATORS_LABELS.NOT_CONTAINS_ANY, value: OPERATORS.NOT_CONTAINS_ANY },
          { label: OPERATORS_LABELS.EMPTY, value: OPERATORS.EMPTY },
        ],
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
          { label: OPERATORS_LABELS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
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

    it('should return an empty array for unknown data type', () => {
      const options = getOperatorOptions({
        dataType: 'UnknownType',
        hasSourceOrValues: false,
        intl: intlMock,
      });

      expect(options).toEqual([]);

      expect(intlMock.formatMessage).not.toHaveBeenCalled();
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

  test('should return options that match the input value', () => {
    const res = getFilteredOptions('Receiving', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Holdings — Receiving history display type' }]);
  });

  test('should retain special characters like em dash (—) in the input and match labels', () => {
    // The em dash (—) should be preserved, allowing this search to match.
    const res = getFilteredOptions('Instances — Updated date', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Instances — Updated date' }]);
  });

  test('should ignore other special characters but still match meaningful content', () => {
    // Ignore special characters like '*' and '!', and match only the meaningful content.
    const res = getFilteredOptions('Items — Ins*tan!ces — Upd?ate.', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Instances — Updated date' }]);
  });

  test('should return entire list if put "—"', () => {
    const res = getFilteredOptions('—', mockDataOptions);

    expect(res).toEqual(mockDataOptions);
  });

  test('should match values case-insensitively', () => {
    const res = getFilteredOptions(' — statements', mockDataOptions);

    expect(res).toEqual([{ label: 'Items — Holdings — Statements' }]);
  });

  test('should return all options if input value is an empty string', () => {
    const res = getFilteredOptions('', mockDataOptions);

    expect(res).toEqual(mockDataOptions);
  });

  test('should return an empty array if no options match', () => {
    const res = getFilteredOptions('no such option present', mockDataOptions);

    expect(res).toEqual([]);
  });
});
