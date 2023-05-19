import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Intl from '../../../../../test/jest/__mock__/intlProvider.mock';
import { DataTypeInput } from './DataTypeInput';
import { DATA_TYPES } from '../../../../constants/dataTypes';
import { OPERATORS } from '../../../../constants/operators';

const queryClient = new QueryClient();
const mockSource = {
  source: {
    entityTypeId: '1',
    columnName: 'test',
  },
};
const renderDataTypeInput = ({
  onChange,
  dataType,
  operator,
  source,
  availableValues,
}) => render(
  <Intl>
    <QueryClientProvider client={queryClient}>
      <DataTypeInput
        onChange={onChange}
        dataType={dataType}
        operator={operator}
        source={source}
        availableValues={availableValues}
      />
    </QueryClientProvider>,
  </Intl>,
);

const arr = [
  {
    dataType: DATA_TYPES.StringType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-single-stringType',
    onChange: jest.fn(),
    availableValues: [],
  },
  {
    dataType: DATA_TYPES.StringType,
    operator: OPERATORS.NOT_IN,
    componentTestId: 'data-input-select-multi-stringType',
    availableValues: [],
  },
  {
    dataType: DATA_TYPES.StringType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-text-stringType',
    onChange: jest.fn(),
  },

  {
    dataType: DATA_TYPES.BooleanType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-boolType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.RangedUUIDType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-text-rangedUUIDType',
  },
  {
    dataType: DATA_TYPES.OpenUUIDType,
    operator: OPERATORS.IN,
    componentTestId: 'data-input-textarea',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.OpenUUIDType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-text-openUUIDType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.IN,
    text: 'stripes-components.multiSelection.defaultEmptyMessage',
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-arrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.EnumType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-arrayType',
    onChange: jest.fn(),
    availableValues: [
      { label: 'Available', value: 'available' },
      { label: 'Checked out', value: 'checked' },
    ],
  },
  {
    dataType: DATA_TYPES.EnumType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-arrayType',
    onChange: jest.fn(),
    source: mockSource,
  },
  {
    dataType: DATA_TYPES.DateType,
    operator: OPERATORS.GREATER_THAN,
    componentTestId: 'data-input-dateType',
    onChange: jest.fn(),
  },
  {
    dataType: 'DEFAULT',
    operator: OPERATORS.GREATER_THAN,
    componentTestId: 'data-input-text-default',
    onChange: jest.fn(),
  },
];

describe('DataTypeInput', () => {
  afterEach(() => {
    cleanup();
  });

  for (const { dataType, operator, componentTestId, text, onChange, source, availableValues } of arr) {
    it(`should render correct component based on ${dataType} and ${operator}`, () => {
      renderDataTypeInput({ dataType, operator, onChange, source, availableValues });
      const el = screen.queryByTestId(componentTestId || '') || screen.queryByText(text || '');

      expect(el).toBeInTheDocument();

      if (onChange) {
        fireEvent.change(el, { target: { value: 2 } });

        expect(onChange).toHaveBeenCalled();
      }
    });
  }
});
