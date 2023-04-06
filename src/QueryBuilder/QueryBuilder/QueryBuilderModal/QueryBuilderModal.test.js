import { screen, render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@folio/stripes-acq-components/test/jest/__mock__';
import '../../../../test/jest/__mock__/stripesSmartComponents.mock';
import { QueryBuilderModal } from './QueryBuilderModal';
import { entityType } from '../../../../test/jest/data/entityType';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
}));

const queryClient = new QueryClient();

const renderQueryBuilderModal = (
  setIsModalShown = jest.fn(),
  isOpen = true,
  saveBtnLabel = '',
) => render(
  <QueryClientProvider client={queryClient}>
    <QueryBuilderModal
      setIsModalShown={setIsModalShown}
      isOpen={isOpen}
      saveBtnLabel={saveBtnLabel}
    />
  </QueryClientProvider>,
);

describe('QueryBuilderModal', () => {
  it('should render modal', async () => {
    renderQueryBuilderModal();

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should render only field select by default', () => {
    renderQueryBuilderModal();

    const cols = entityType.columns.filter(c => c.visibleByDefault);

    cols.forEach(col => {
      expect(screen.getByText(`${col.labelAlias}`)).toBeInTheDocument();
    });
  });

  it('shold render boolean select when row added', () => {
    renderQueryBuilderModal();

    const addButton = screen.getByRole('button', { name: /plus-sign/ });

    act(() => userEvent.click(addButton));

    const rows = screen.getAllByRole('listitem');

    expect(rows.length).toEqual(2);
    expect(screen.getByRole('combobox', { name: /boolean-option/ })).toBeVisible();
  });

  it('shold render boolean select when row added', () => {
    renderQueryBuilderModal();

    const addButton = screen.getByRole('button', { name: /plus-sign/ });

    act(() => userEvent.click(addButton));

    const rows = screen.getAllByRole('listitem');

    expect(rows.length).toEqual(2);
    expect(screen.getByRole('combobox', { name: /boolean-option/ })).toBeVisible();
  });

  it('shold remove row when remove button clicked', () => {
    renderQueryBuilderModal();

    const addButton = screen.getByRole('button', { name: /plus-sign/ });

    act(() => userEvent.click(addButton));

    const removeButtons = screen.getAllByRole('button', { name: /trash/ });

    act(() => userEvent.click(removeButtons[1]));

    const rows = screen.getAllByRole('listitem');

    expect(rows.length).toEqual(1);
  });

  it('should render new label with saveBtnLabel', () => {
    renderQueryBuilderModal(jest.fn(), true, 'testText');

    expect(screen.getByText(/testText/)).toBeVisible();
  });
});
