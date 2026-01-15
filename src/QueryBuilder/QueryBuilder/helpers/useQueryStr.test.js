import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';

import { RootContext } from '../../../context/RootContext';
import { useQueryStr } from './query';

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: ({ id }) => id,
  }),
}));

jest.mock('../../../hooks/useTenantTimezone', () => {
  return () => ({ tenantTimezone: 'UTC' });
});

describe('useQueryStr', () => {
  it('sets rows to [] when no source and no fqlQuery are provided', async () => {
    const getDataOptions = jest.fn(() => []);
    const getDataOptionsWithFetching = jest.fn(() => []);

    const wrapper = ({ children }) => (
      <RootContext.Provider value={{ getDataOptions, getDataOptionsWithFetching }}>
        {children}
      </RootContext.Provider>
    );

    const { result } = renderHook(
      () => useQueryStr(undefined, { source: undefined, fqlQuery: undefined }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current).toBe('');
    });
  });

  it('returns early (keeps loading) when fqlQuery exists but entityType is not loaded yet', async () => {
    const getDataOptions = jest.fn(() => []);
    const getDataOptionsWithFetching = jest.fn(() => []);

    const wrapper = ({ children }) => (
      <RootContext.Provider value={{ getDataOptions, getDataOptionsWithFetching }}>
        {children}
      </RootContext.Provider>
    );

    const { result } = renderHook(
      () => useQueryStr(undefined, { source: undefined, fqlQuery: { user_first_name: { $eq: 'value' } } }),
      { wrapper },
    );

    // When entityType is missing but fqlQuery exists, the hook should remain in the loading state
    expect(React.isValidElement(result.current)).toBe(true);
  });
});