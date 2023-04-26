import { screen, render, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QueryBuilderModal } from './QueryBuilderModal';
import { entityType } from '../../../../test/jest/data/entityType';
import {
  entityTypeDataSource,
  queryDetailsDataSource,
  runQueryDataSource,
  testQueryDataSource,
} from '../../../../test/jest/data/sources';

const queryClient = new QueryClient();

const renderQueryBuilderModal = ({
  setIsModalShown = jest.fn(),
  onQueryRun = jest.fn(),
  isOpen = true,
  saveBtnLabel = '',
}) => render(
  <QueryClientProvider client={queryClient}>
    <QueryBuilderModal
      setIsModalShown={setIsModalShown}
      isOpen={isOpen}
      saveBtnLabel={saveBtnLabel}
      onQueryRun={onQueryRun}
      entityTypeDataSource={entityTypeDataSource}
      runQueryDataSource={runQueryDataSource}
      queryDetailsDataSource={queryDetailsDataSource}
      testQueryDataSource={testQueryDataSource}
      onQueryRunSuccess={(v) => console.log(v)}
      onQueryRunFail={(v) => console.log(v)}
    />
  </QueryClientProvider>,
);

describe('QueryBuilderModal', () => {
  it('should render modal', async () => {
    renderQueryBuilderModal({});

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should render only field select by default', () => {
    renderQueryBuilderModal({});

    const cols = entityType.columns.filter(c => c.visibleByDefault);

    cols.forEach(col => {
      expect(screen.getByText(`${col.labelAlias}`)).toBeInTheDocument();
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

    const runQuery = screen.getByRole('button', { name: /ui-plugin-query-builder.modal.run/ });
    const testQuery = screen.getByRole('button', { name: /ui-plugin-query-builder.modal.test/ });
    const userFirstNameOption = screen.getByText(/User first name/);

    expect(runQuery).toBeDisabled();
    expect(testQuery).toBeDisabled();

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
      expect(runQuery).toBeEnabled();
    });

    act(() => userEvent.click(runQuery));
  });
});
