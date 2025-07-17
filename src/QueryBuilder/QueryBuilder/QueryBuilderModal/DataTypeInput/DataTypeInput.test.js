import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { noop } from 'lodash';
import { QueryClient, QueryClientProvider } from 'react-query';
import Intl from '../../../../../test/jest/__mock__/intlProvider.mock';
import '../../../../../test/jest/__mock__/resizeObserver.mock';
import { DataTypeInput } from './DataTypeInput';
import { DATA_TYPES, ORGANIZATIONS_TYPES } from '../../../../constants/dataTypes';
import { OPERATORS } from '../../../../constants/operators';
import { RootContext } from '../../../../context/RootContext';

jest.mock('../../../../hooks/useParamsDataSource', () => ({
  useParamsDataSource: jest.fn().mockReturnValue({
    data: {
      content: [
        { label: 'Available', value: 'available' },
        { label: 'Checked out', value: 'checked' },
      ],
    },
    isLoading: false,
  }),
}));

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  Pluggable: ({ children }) => <div>{children}</div>,
  useOkapiKy: jest.fn().mockReturnValue({
    okapi: 'test',
  }),
}));

jest.mock('../../../../hooks/useTenantTimezone', () => jest.fn(() => ({
  tenantTimezone: 'UTC',
})));

const queryClient = new QueryClient();
const mockSource = {
  source: {
    entityTypeId: '1',
    columnName: 'test',
  },
};

const setDataOptionsMock = jest.fn();

const renderDataTypeInput = ({
  onChange,
  dataType,
  operator,
  source,
  availableValues,
  value,
}) => render(
  <Intl>
    <RootContext.Provider value={{ setDataOptions: setDataOptionsMock }}>
      <QueryClientProvider client={queryClient}>
        <DataTypeInput
          onChange={onChange}
          dataType={dataType}
          operator={operator}
          source={source}
          availableValues={availableValues}
          getParamsSource={noop}
          value={value}
        />
      </QueryClientProvider>,
    </RootContext.Provider>
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
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.CONTAINS,
    componentTestId: 'data-input-text-jsonbArrayType',
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
    dataType: DATA_TYPES.BooleanType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-boolType',
    onChange: jest.fn(),
    value: 'False',
    availableValues: [
      { label: 'True', value: true },
      { label: 'False', value: false },
    ],
  },
  {
    dataType: DATA_TYPES.BooleanType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-boolType',
    onChange: jest.fn(),
    value: 'True',
    availableValues: [
      { label: 'True', value: true },
      { label: 'False', value: false },
    ],
  },
  {
    dataType: 'DEFAULT',
    operator: OPERATORS.GREATER_THAN,
    componentTestId: 'data-input-text-default',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-single-arrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-text-arrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-select-single-jsonbArrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.EQUAL,
    componentTestId: 'data-input-text-jsonbArrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.NOT_EQUAL,
    componentTestId: 'data-input-select-single-arrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.NOT_EQUAL,
    componentTestId: 'data-input-text-arrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.CONTAINS,
    componentTestId: 'data-input-select-single-arrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.CONTAINS,
    componentTestId: 'data-input-text-arrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.NOT_EQUAL,
    componentTestId: 'data-input-select-single-jsonbArrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.NOT_EQUAL,
    componentTestId: 'data-input-text-jsonbArrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.CONTAINS,
    componentTestId: 'data-input-select-single-jsonbArrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.CONTAINS,
    componentTestId: 'data-input-text-jsonbArrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.IN,
    componentTestId: 'data-input-select-multi-arrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.IN,
    componentTestId: 'data-input-text-arrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.IN,
    componentTestId: 'data-input-select-multi-jsonbArrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.IN,
    componentTestId: 'data-input-text-jsonbArrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.NOT_IN,
    componentTestId: 'data-input-select-multi-arrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.ArrayType,
    operator: OPERATORS.NOT_IN,
    componentTestId: 'data-input-text-arrayType',
    onChange: jest.fn(),
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.NOT_IN,
    componentTestId: 'data-input-select-multi-jsonbArrayType',
    onChange: jest.fn(),
    availableValues: [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }],
  },
  {
    dataType: DATA_TYPES.JsonbArrayType,
    operator: OPERATORS.NOT_IN,
    componentTestId: 'data-input-text-jsonbArrayType',
    onChange: jest.fn(),
  },
];

describe('DataTypeInput', () => {
  afterEach(() => {
    cleanup();
  });

  for (const { dataType, operator, componentTestId, text, onChange, source, availableValues, value } of arr) {
    it(`should render correct component based on ${dataType} and ${operator}`, async () => {
      const {
        queryByTestId,
        queryByText,
      } = renderDataTypeInput({ dataType, operator, onChange, source, availableValues, value });
      const el = queryByTestId(componentTestId || '') || queryByText(text || '');

      await waitFor(() => {
        expect(el).toBeVisible();

        if (onChange) {
          const testValue = dataType === DATA_TYPES.BooleanType ? 'true' : 2;

          fireEvent.change(el, { target: { value: testValue } });
          expect(onChange).toHaveBeenCalled();
        }
      });
    });
  }
});

describe('DataTypeInput with Pluggable', () => {
  it('should render multi select and Pluggable when operator is IN and source is ORGANIZATIONS_TYPES', async () => {
    const onChangeMock = jest.fn();

    const {
      getByTestId,
      getByText,
    } = renderDataTypeInput({
      dataType: DATA_TYPES.StringType,
      operator: OPERATORS.IN,
      source: { name: ORGANIZATIONS_TYPES },
      onChange: onChangeMock,
      availableValues: ['a', 'b'],
    });

    await waitFor(() => {
      expect(getByTestId('data-input-select-multi-stringType')).toBeVisible();
      expect(getByText(/filter.organization.lookupNoSupport/)).toBeVisible();
    });
  });

  it('should render single select and Pluggable when operator is EQUAL and source is ORGANIZATIONS_TYPES', async () => {
    const onChangeMock = jest.fn();

    const {
      getByTestId,
      getByText,
    } = renderDataTypeInput({
      dataType: DATA_TYPES.StringType,
      operator: OPERATORS.EQUAL,
      source: { name: ORGANIZATIONS_TYPES },
      onChange: onChangeMock,
      availableValues: ['a', 'b'],
    });

    await waitFor(() => {
      expect(getByTestId('data-input-select-single-stringType')).toBeVisible();
      expect(getByText(/filter.organization.lookupNoSupport/)).toBeVisible();
    });
  });
});


