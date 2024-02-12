import { getFieldOptions, getOperatorOptions } from './selectOptions';
import { DATA_TYPES } from '../../../constants/dataTypes';
import { OPERATORS } from '../../../constants/operators';

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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.CONTAINS, value: OPERATORS.CONTAINS },
          { label: OPERATORS.STARTS_WITH, value: OPERATORS.STARTS_WITH },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.IN, value: OPERATORS.IN },
          { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
          { label: OPERATORS.LESS_THAN, value: OPERATORS.LESS_THAN },
          { label: OPERATORS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
          { label: OPERATORS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
          { label: OPERATORS.LESS_THAN, value: OPERATORS.LESS_THAN },
          { label: OPERATORS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
          { label: OPERATORS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.IN, value: OPERATORS.IN },
          { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.IN, value: OPERATORS.IN },
          { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
          { label: OPERATORS.CONTAINS, value: OPERATORS.CONTAINS },
          { label: OPERATORS.NOT_CONTAINS, value: OPERATORS.NOT_CONTAINS },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.IN, value: OPERATORS.IN },
          { label: OPERATORS.NOT_IN, value: OPERATORS.NOT_IN },
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
          { label: OPERATORS.EQUAL, value: OPERATORS.EQUAL },
          { label: OPERATORS.NOT_EQUAL, value: OPERATORS.NOT_EQUAL },
          { label: OPERATORS.GREATER_THAN, value: OPERATORS.GREATER_THAN },
          { label: OPERATORS.LESS_THAN, value: OPERATORS.LESS_THAN },
          { label: OPERATORS.GREATER_THAN_OR_EQUAL, value: OPERATORS.GREATER_THAN_OR_EQUAL },
          { label: OPERATORS.LESS_THAN_OR_EQUAL, value: OPERATORS.LESS_THAN_OR_EQUAL },
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
