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
  />
);

describe('QueryBuilderModal', () => {
  it('should render modal', async () => {
    renderQueryBuilderModal();

    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should render only field select by default', () => {
    renderQueryBuilderModal();

    const allSelects = screen.getAllByRole('combobox');

    expect(allSelects.length).toEqual(1);
    expect(screen.getByRole('combobox', { name: /field-option/ })).toBeVisible();
  });

  it('shold render operator select when field selected', () => {
    renderQueryBuilderModal();

    const fieldSelect = screen.getByRole('combobox', { name: /field-option/ });
    const fieldoption = screen.getByRole('option', { name: /status/ });

    act(() => userEvent.selectOptions(fieldSelect, fieldoption));

    expect(screen.getByRole('combobox', { name: /operator-option/ })).toBeVisible();
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

  // describe('Render accordion and titles', () => {
  //   it('should render accordion if accordionHeadline prop is present', async () => {
  //     render(renderResultViewer());

  //     expect(screen.getByTestId('results-viewer-accordion')).toBeVisible();
  //   });

  //   it('should not render accordion if accordionHeadline prop is NULL', async () => {
  //     render(renderResultViewer({ accordionHeadline: null }));

  //     expect(screen.queryByTestId('results-viewer-accordion')).toBeNull();
  //   });

  //   it('should render subtitle with correct count of records', async () => {
  //     render(renderResultViewer());

  //     await waitFor(() => {
  //       expect(screen.queryByText('Loading')).not.toBeInTheDocument();

  //       expect(screen.getByText(`${content.totalElements} records found`)).toBeVisible();
  //     });
  //   });
  // });

  // describe('Initial and visible columns setters', () => {
  //   it('should be called only once', async () => {
  //     render(renderResultViewer());

  //     await waitFor(() => {
  //       expect(screen.queryByText('Loading')).not.toBeInTheDocument();

  //       expect(setVisibleColumns).toHaveBeenCalledTimes(1);
  //       expect(setColumns).toHaveBeenCalledTimes(1);
  //     });
  //   });
  // });

  // describe('Records table', () => {
  //   it('should be rendered with pagination', async () => {
  //     render(renderResultViewer());

  //     await waitFor(() => {
  //       expect(screen.queryByText('Loading')).not.toBeInTheDocument();

  //       expect(screen.getByTestId('results-viewer-table')).toBeVisible();
  //       expect(screen.getByText('Pagination')).toBeVisible();
  //     });
  //   });
  // });

  // describe('In progress state', () => {
  //   it('Should render in progress when ', async () => {
  //     const inProgressTitle = 'title';

  //     render(renderResultViewer({
  //       isInProgress: true,
  //       inProgressTitle,
  //     }));

  //     expect(screen.getByText(inProgressTitle)).toBeVisible();
  //   });
  // });
});
