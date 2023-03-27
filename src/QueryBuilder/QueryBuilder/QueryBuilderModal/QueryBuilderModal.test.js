import { screen, render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@folio/stripes-acq-components/test/jest/__mock__';
import { QueryBuilderModal } from './QueryBuilderModal';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
}));

const renderQueryBuilderModal = (
  setIsModalShown = jest.fn(),
  isOpen = true,
) => render(
  <QueryBuilderModal
    setIsModalShown={setIsModalShown}
    isOpen={isOpen}
  />,
);

describe('QueryBuilderModal', () => {
  it('should render modal', async () => {
    renderQueryBuilderModal();

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should render only field select by default', () => {
    renderQueryBuilderModal();

    expect(screen.getByText(/Effective Call Number/)).toBeInTheDocument();
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
});
