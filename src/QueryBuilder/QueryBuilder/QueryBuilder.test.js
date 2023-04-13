import { QueryClient, QueryClientProvider } from 'react-query';
import { logDOM, render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { QueryBuilder } from './QueryBuilder';

jest.mock('@folio/stripes/components', () => jest.requireActual('@folio/stripes/components'));

const queryClient = new QueryClient();

const renderQueryBuilder = ({
  disabled,
  saveBtnLabel,
  initialValues,
  runQuerySource = jest.fn(),
  testQuerySource = jest.fn(),
  onQueryRun = jest.fn(),
}) => render(
  <IntlProvider locale="en">
    <QueryClientProvider client={queryClient}>
      <QueryBuilder
        disabled={disabled}
        saveBtnLabel={saveBtnLabel}
        initialValues={initialValues}
        runQuerySource={runQuerySource}
        testQuerySource={testQuerySource}
        onQueryRun={onQueryRun}
      />
    </QueryClientProvider>,
  </IntlProvider>,
);

describe('QueryBuilder', () => {
  it('test', () => {
    renderQueryBuilder({});

    logDOM();
  });
});
