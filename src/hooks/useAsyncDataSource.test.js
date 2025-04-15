import { QueryClient, QueryClientProvider } from 'react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useNamespace } from '@folio/stripes/core';
import { useShowCallout } from '@folio/stripes-acq-components';

import { useAsyncDataSource } from './useAsyncDataSource';
import { useDebounce } from './useDebounce';
import { useEntityType } from './useEntityType';

import '../../test/jest/__mock__';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: jest.fn(),
  useNamespace: jest.fn().mockReturnValue(['1', '2', '3']),
}));

jest.mock('@folio/stripes-acq-components', () => ({
  useShowCallout: jest.fn(),
}));

jest.mock('./useDebounce', () => ({
  useDebounce: jest.fn(),
}));

jest.mock('./useEntityType', () => ({
  useEntityType: jest.fn(),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockShowCallout = jest.fn();

describe('useAsyncDataSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNamespace.mockImplementation(() => ['test-namespace']);
    useShowCallout.mockReturnValue(mockShowCallout);
    useDebounce.mockImplementation((value) => value);
    useEntityType.mockReturnValue({
      entityType: 'testEntityType',
      isContentTypeFetchedAfterMount: false,
      isEntityTypeLoading: false,
    });
  });

  it('should handle successful query execution', async () => {
    const contentDataSource = jest.fn().mockResolvedValue({
      content: [{ id: 1, name: 'Test Record' }],
      totalRecords: 1,
      status: 'success',
    });

    const onSuccess = jest.fn();
    const contentQueryOptions = {
      refetchInterval: jest.fn(() => 1000),
      completeExecution: jest.fn(),
      keepPreviousData: true,
    };

    const { result } = renderHook(() => useAsyncDataSource({
      contentDataSource,
      entityTypeDataSource: jest.fn(),
      offset: 0,
      limit: 10,
      queryParams: {},
      onSuccess,
      contentQueryOptions,
      contentQueryKeys: [],
      forcedVisibleValues: [],
    }), { wrapper });

    expect(result.current.isContentDataLoading).toBe(true);

    await act(async () => {
      await waitFor(() => expect(contentDataSource).toHaveBeenCalled());
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.contentData).toEqual([{ id: 1, name: 'Test Record' }]);
    expect(result.current.totalRecords).toBe(1);
  });
});
