import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Intl from '../../../../../test/jest/__mock__/intlProvider.mock';
import '../../../../../test/jest/__mock__/resizeObserver.mock';
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

const mockGetParamsSource = async () => ({
  content: [
    { label: 'Available', value: 'available' },
    { label: 'Checked out', value: 'checked' },
  ],
});

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
        getParamsSource={mockGetParamsSource}
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
    dataType: DATA_TYPES.StringUUIDType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-text-stringUUIDType',
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
    operator: OPERATORS.CONTAINS,
    componentTestId: 'data-input-text-arrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.EnumType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-arrayType',
    onChange: jest.fn(),
    availableValues: ['available', 'checked'],
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
    dataType: DATA_TYPES.BooleanType,
    operator: OPERATORS.EMPTY,
    componentTestId: 'data-input-select-booleanType',
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
    it(`should render correct component based on ${dataType} and ${operator}`, async () => {
      const {
        queryByTestId,
        queryByText,
      } = renderDataTypeInput({ dataType, operator, onChange, source, availableValues });
      const el = queryByTestId(componentTestId || '') || queryByText(text || '');

      await waitFor(() => {
        expect(el).toBeVisible();

        if (onChange) {
          fireEvent.change(el, { target: { value: 2 } });

          expect(onChange).toHaveBeenCalled();
        }
      });
    });
  }
});
