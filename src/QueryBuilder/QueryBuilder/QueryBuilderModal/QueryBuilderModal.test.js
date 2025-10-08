import { screen, render, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { QueryBuilderModal } from './QueryBuilderModal';
import { entityType } from '../../../../test/jest/data/entityType';
import {
  cancelQueryDataSource,
  entityTypeDataSource, getParamsSource,
  queryDetailsDataSource,
  runQueryDataSource,
  testQueryDataSource,
} from '../../../../test/jest/data/sources';
import { getFieldOptions } from '../helpers/selectOptions';
import { RootContext } from '../../../context/RootContext';

const queryClient = new QueryClient();

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Layer: ({ children, isOpen }) => (isOpen ? <div role="dialog">{children}</div> : null),
  Loading: () => <div>LOADING</div>,
}));

const mockEntityType = entityType;

jest.mock('../../../hooks/useEntityType', () => ({
  useEntityType: () => ({ entityType: mockEntityType, isEntityTypeFetching: false, isEntityTypeLoading: false }),
}));

jest.mock('../../../hooks/useTenantTimezone', () => jest.fn(() => ({
  tenantTimezone: 'UTC',
})));

const onRunSuccessMock = jest.fn();

const renderQueryBuilderModal = ({
  setIsModalShown = jest.fn(),
  onQueryRunFail = jest.fn(),
  isOpen = true,
  saveBtnLabel = '',
  onQueryRunSuccess = onRunSuccessMock,
  ...rest
}) => render(
  <QueryClientProvider client={queryClient}>
    <RootContext.Provider value={{ setVisibleColumns: () => {}, getDataOptions: () => [] }}>
      <QueryBuilderModal
        setIsModalShown={setIsModalShown}
        isOpen={isOpen}
        saveBtnLabel={saveBtnLabel}
        getParamsSource={getParamsSource}
        entityTypeDataSource={entityTypeDataSource}
        runQueryDataSource={runQueryDataSource}
        queryDetailsDataSource={queryDetailsDataSource}
        testQueryDataSource={testQueryDataSource}
        cancelQueryDataSource={cancelQueryDataSource}
        onQueryRunSuccess={onQueryRunSuccess}
        onQueryRunFail={onQueryRunFail}
        {...rest}
      />
    </RootContext.Provider>
  </QueryClientProvider>,
);

const fillFormAndClickTestQuery = async () => {
  const testQuery = screen.getByRole('button', { name: /ui-plugin-query-builder.modal.test/ });

  const selectFieldPlaceholder = screen.findByText('ui-plugin-query-builder.control.selection.placeholder');

  await userEvent.click(await selectFieldPlaceholder);

  let userFirstNameOption;

  await waitFor(() => {
    userFirstNameOption = screen.getByText(/User first name/);

    expect(userFirstNameOption).toBeVisible();
  });

  userEvent.click(userFirstNameOption);

  await waitFor(async () => expect(await screen.findByTestId('operator-option-0')).toBeVisible());

  fireEvent.change(screen.getByTestId('operator-option-0'), { target: { value: '==' } });

  await waitFor(() => {
    expect(screen.getByTestId('input-value-0')).toBeVisible();
    expect(testQuery).toBeDisabled();
  });

  userEvent.type(screen.getByTestId('input-value-0'), '123');

  await waitFor(() => {
    expect(testQuery).toBeEnabled();
  });

  userEvent.click(testQuery);
};

describe('QueryBuilderModal', () => {
  it('should render modal', async () => {
    renderQueryBuilderModal({});
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should render only field select by default', async () => {
    renderQueryBuilderModal({});

    await waitFor(() => {
      expect(screen.queryByText('LOADING')).not.toBeInTheDocument();
    });

    let selectFieldPlaceholder;

    await waitFor(() => {
      selectFieldPlaceholder = screen.getByText('ui-plugin-query-builder.control.selection.placeholder');
    });

    act(() => userEvent.click(selectFieldPlaceholder));

    await waitFor(() => {
      getFieldOptions(entityType.columns).forEach(col => {
        expect(screen.getByText(`${col.label}`)).toBeInTheDocument();
      });

      expect(screen.queryByText('Not queryable')).toBeNull();
    });
  });

  it('should render boolean select when row added', async () => {
    renderQueryBuilderModal({});

    let addButton;

    await waitFor(() => {
      addButton = screen.getByRole('button', { name: /plus-sign/ });

      expect(addButton).toBeInTheDocument();
    });

    act(() => userEvent.click(addButton));

    const rows = screen.getAllByRole('listitem');

    expect(rows.length).toEqual(2);
    expect(screen.getByRole('combobox', { name: /boolean-option/ })).toBeVisible();
  });

  it('should remove row when remove button clicked', async () => {
    renderQueryBuilderModal({});

    let addButton;

    await waitFor(() => {
      addButton = screen.getByRole('button', { name: /plus-sign/ });

      expect(addButton).toBeInTheDocument();
    });

    act(() => userEvent.click(addButton));

    const removeButtons = screen.getAllByRole('button', { name: /trash/ });

    act(() => userEvent.click(removeButtons[1]));

    const rows = screen.getAllByRole('listitem');

    expect(rows.length).toEqual(1);
  });

  it('should render new label with saveBtnLabel', () => {
    renderQueryBuilderModal({
      saveBtnLabel: 'testText',
    });

    expect(screen.getByText(/testText/)).toBeVisible();
  });

  it('should show progress table when form valid and testQuery button clicked', async () => {
    renderQueryBuilderModal({});

    await waitFor(() => {
      expect(screen.queryByText('LOADING')).not.toBeInTheDocument();
    });

    await fillFormAndClickTestQuery();

    await waitFor(() => {
      expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();
    });
  });

  it.skip('should show banner if limit is exceeded', async () => {
    renderQueryBuilderModal({
      recordsLimit: 1,
    });

    await waitFor(() => {
      expect(screen.queryByText('LOADING')).not.toBeInTheDocument();
    });

    await fillFormAndClickTestQuery();

    await waitFor(() => {
      expect(screen.queryByText('ui-plugin-query-builder.modal.banner.limit')).toBeVisible();
    }, { timeout: 5000 });
  });
});
