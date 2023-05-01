import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryBuilder } from './QueryBuilder';
import Intl from '../../../test/jest/__mock__/intl.mock';

const queryClient = new QueryClient();

const renderQueryBuilder = ({
  disabled,
  saveBtnLabel,
  initialValues,
  runQueryDataSource = jest.fn(),
  testQuerySource = jest.fn(),
  onQueryRun = jest.fn(),
}) => render(
  <Intl>
    <QueryClientProvider client={queryClient}>
      <QueryBuilder
        disabled={disabled}
        saveBtnLabel={saveBtnLabel}
        initialValues={initialValues}
        runQuerySource={runQueryDataSource}
        testQuerySource={testQuerySource}
        onQueryRun={onQueryRun}
      />
    </QueryClientProvider>,
  </Intl>,
);

describe('QueryBuilder', () => {
  it('should show/close query builder modal by show/cancel buttons click', async () => {
    renderQueryBuilder({});

    expect(screen.queryByRole('dialog')).toBeNull();

    const trigger = screen.getByRole('button', { name: /ui-plugin-query-builder.trigger/ });

    act(() => userEvent.click(trigger));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeVisible();
    });

    const cancel = screen.getByRole('button', { name: /ui-plugin-query-builder.modal.cancel/ });

    act(() => userEvent.click(cancel));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
