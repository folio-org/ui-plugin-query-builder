import { act } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { renderHook } from '@testing-library/react';

import {
  useTenantPreferences,
  usePreferences,
} from '@folio/stripes/core';

import useTenantTimezone, { getQueryWarning } from './useTenantTimezone';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useTenantPreferences: jest.fn(),
  usePreferences: jest.fn(),
  userOwnLocaleConfig: {
    SCOPE: 'user-scope',
    KEY: 'user-key',
  },
  tenantLocaleConfig: {
    SCOPE: 'tenant-scope',
    KEY: 'user-key',
  },
  useStripes: jest.fn().mockReturnValue({
    user: {
      user: {
        id: 'user-id',
      },
    },
    okapi: {
      tenant: 'tenant-id',
    },
  }),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useTenantTimezone', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useTenantPreferences.mockReturnValue({
      getTenantPreference: jest.fn().mockResolvedValue({ timezone: 'UTC' }),
    });

    usePreferences.mockReturnValue({
      getPreference: jest.fn().mockResolvedValue({ timezone: 'Pacific/Yap' }),
    });
  });

  it('should return user and tenant timezone', async () => {
    const { result } = await act(() => renderHook(useTenantTimezone, { wrapper }));

    expect(result.current).toEqual({
      userTimezone: 'Pacific/Yap',
      tenantTimezone: 'UTC',
      timezoneQueryWarning: 'a warning should go here! TODO [UIPQB-155]',
    });
  });
});

describe('timezone query warning', () => {
  it.each([
    [null, null],
    [null, undefined],
    ['', null],
    ['', undefined],
    ['Narnia', null],
    ['Narnia', undefined],
    ['Narnia', 'Narnia'],
  ])('returns no warning for [%s,%s]', (a, b) => {
    expect(getQueryWarning(a, b)).toBeNull();
    expect(getQueryWarning(b, a)).toBeNull();
  });

  it('returns a warning for different timezones', () => {
    expect(getQueryWarning('Narnia', 'Atlantis')).not.toBeNull();
  });
});
