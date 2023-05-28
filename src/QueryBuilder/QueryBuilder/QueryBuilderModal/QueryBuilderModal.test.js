import { screen, render, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const queryClient = new QueryClient();

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: () => <div>LOADING</div>,
}));

const onRunSuccessMock = jest.fn();

const renderQueryBuilderModal = ({
  setIsModalShown = jest.fn(),
  onQueryRunFail = jest.fn(),
  isOpen = true,
  saveBtnLabel = '',
  onQueryRunSuccess = onRunSuccessMock,
}) => render(
  <QueryClientProvider client={queryClient}>
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
    />
  </QueryClientProvider>,
);

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

    const selectFieldPlaceholder = screen.getByText('ui-plugin-query-builder.control.selection.placeholder');

    act(() => userEvent.click(selectFieldPlaceholder));

    await waitFor(() => {
      getFieldOptions(entityType.columns).forEach(col => {
        expect(screen.getByText(`${col.label}`)).toBeInTheDocument();
      });
    });
  });

  it('should render boolean select when row added', () => {
    renderQueryBuilderModal({});

    const addButton = screen.getByRole('button', { name: /plus-sign/ });

    act(() => userEvent.click(addButton));

    const rows = screen.getAllByRole('listitem');

    expect(rows.length).toEqual(2);
    expect(screen.getByRole('combobox', { name: /boolean-option/ })).toBeVisible();
  });

  it('should remove row when remove button clicked', () => {
    renderQueryBuilderModal({});

    const addButton = screen.getByRole('button', { name: /plus-sign/ });

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

    const runQuery = screen.getByRole('button', { name: /ui-plugin-query-builder.modal.run/ });
    const testQuery = screen.getByRole('button', { name: /ui-plugin-query-builder.modal.test/ });

    expect(runQuery).toBeDisabled();
    expect(testQuery).toBeDisabled();

    const selectFieldPlaceholder = screen.getByText('ui-plugin-query-builder.control.selection.placeholder');

    act(() => userEvent.click(selectFieldPlaceholder));

    let userFirstNameOption;

    await waitFor(() => {
      userFirstNameOption = screen.getByText(/User first name/);

      expect(userFirstNameOption).toBeVisible();
    });

    userEvent.click(userFirstNameOption);

    fireEvent.change(screen.getByTestId('operator-option-0'), { target: { value: '==' } });

    await waitFor(() => {
      expect(screen.getByTestId('input-value-0')).toBeVisible();
      expect(testQuery).toBeDisabled();
    });

    userEvent.type(screen.getByTestId('input-value-0'), '123');

    await waitFor(() => {
      expect(testQuery).toBeEnabled();
    });

    act(() => userEvent.click(testQuery));

    await waitFor(() => {
      expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(runQuery).toBeEnabled();
    }, { timeout: 5500 });

    act(() => userEvent.click(runQuery));

    await waitFor(() => {
      expect(onRunSuccessMock).toHaveBeenCalled();
    });
  });
});
