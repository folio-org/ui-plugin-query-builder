import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import Intl from '../../../../../test/jest/__mock__/intl.mock';
import { DataTypeInput } from './DataTypeInput';
import { DATA_TYPES } from '../../constants/dataTypes';
import { OPERATORS } from '../../constants/operators';

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
  availableValues = [],
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

describe('DataTypeInput', () => {
  afterEach(() => {
    cleanup();
  });

  const arr = [
    { dataType: DATA_TYPES.BooleanType, operator: OPERATORS.EQUAL, componentTestId: 'data-input-select-bool', onChange: jest.fn() },
    { dataType: DATA_TYPES.RangedUUIDType, operator: OPERATORS.IN, text: 'stripes-components.multiSelection.defaultEmptyMessage' },
    { dataType: DATA_TYPES.OpenUUIDType, operator: OPERATORS.IN, componentTestId: 'data-input-textarea', onChange: jest.fn() },
    { dataType: DATA_TYPES.OpenUUIDType, operator: OPERATORS.EQUAL, componentTestId: 'data-input-textField', onChange: jest.fn() },
    { dataType: DATA_TYPES.ArrayType, operator: OPERATORS.IN, text: 'stripes-components.multiSelection.defaultEmptyMessage' },
    { dataType: DATA_TYPES.ArrayType, operator: OPERATORS.EQUAL, componentTestId: 'data-input-select-array', onChange: jest.fn() },
    { dataType: DATA_TYPES.EnumType,
      operator: OPERATORS.EQUAL,
      componentTestId: 'data-input-select-array',
      onChange: jest.fn(),
      availableValues: [
        { label: 'Available', value: 'available' },
        { label: 'Checked out', value: 'checked' },
      ] },
    {
      dataType: DATA_TYPES.EnumType,
      operator: OPERATORS.EQUAL,
      componentTestId: 'data-input-select-array',
      onChange: jest.fn(),
      source: mockSource,
    },
    { dataType: DATA_TYPES.DateType, operator: OPERATORS.GREATER_THAN, componentTestId: 'data-input-datepicker', onChange: jest.fn() },
    { dataType: 'DEFAULT', operator: OPERATORS.GREATER_THAN, componentTestId: 'data-input-default-textField', onChange: jest.fn() },
  ];

  for (const { dataType, operator, componentTestId, text, onChange, source } of arr) {
    it(`should render correct component based on ${dataType} and ${operator}`, () => {
      const wrapper = renderDataTypeInput({ dataType, operator, onChange, source });

      const el = wrapper.queryByTestId(componentTestId || '') || screen.queryByText(text || '');

      expect(el).toBeInTheDocument();

      if (onChange) {
        fireEvent.change(el, { target: { value: 2 } });

        expect(onChange).toHaveBeenCalled();
      }
    });
  }
});
