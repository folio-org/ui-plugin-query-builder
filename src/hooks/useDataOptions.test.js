import { renderHook, waitFor } from '@testing-library/react';
import { DATA_OPTIONS_LOAD_FAILED, isDataOptionsLoadFailure, useDataOptions } from './useDataOptions';
import { ORGANIZATIONS_TYPES } from '../constants/dataTypes';

describe('useDataOptions', () => {
  describe('getDataOptions', () => {
    it('returns empty array for getting unknown fields', () => {
      const { result } = renderHook(() => useDataOptions({}));

      expect(result.current.getDataOptions('unknownField')).toEqual([]);
      expect(result.current.getDataOptions('unknownField', true)).toEqual([]);
    });

    it('only returns promises when requested', () => {
      const { result, rerender } = renderHook(() => useDataOptions({}));

      const promise = new Promise(() => {});

      expect(result.current.getDataOptions('field', true, () => promise)).toEqual(promise);
      rerender();
      expect(result.current.getDataOptions('field', true)).toEqual(promise);
      expect(result.current.getDataOptions('field')).toEqual([]);
    });

    it('does not call fetch promise if data already exists', async () => {
      const { result, rerender } = renderHook(() => useDataOptions({}));

      const fetcher = jest.fn(() => fail('should not be called'));

      result.current.getDataOptions('field', true, () => Promise.resolve(['foo']));

      rerender();

      await waitFor(() => expect(result.current.getDataOptions('field', false, fetcher)).toEqual(['foo']));
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('calls fetch promise if data does not exist', async () => {
      const { result, rerender } = renderHook(() => useDataOptions({}));

      let resolver;
      const promise = new Promise((r) => {
        resolver = r;
      });
      const fetcher = jest.fn(() => promise);

      result.current.getDataOptions('field', true, fetcher);

      expect(fetcher).toHaveBeenCalled();
      rerender();
      expect(result.current.getDataOptions('field')).toEqual([]);
      expect(result.current.getDataOptions('field', true)).toEqual(promise);

      resolver(['foo']);

      // promise gets backfilled into the store as a non-async value once it's available
      await waitFor(() => expect(result.current.getDataOptions('field')).toEqual(['foo']));
    });

    it('calls fetch promise if data exists but more is needed', async () => {
      const { result, rerender } = renderHook(() => useDataOptions({}));

      result.current.getDataOptions('field', true, () => Promise.resolve([{ value: 'foo', label: 'foo' }]));
      rerender();
      await waitFor(() => expect(result.current.getDataOptions('field')).toEqual([{ value: 'foo', label: 'foo' }]));

      const fetcher = jest.fn(() => Promise.resolve([{ value: 'bar', label: 'bar' }]));

      result.current.getDataOptions('field', true, fetcher, ['bar']);
      rerender();
      await waitFor(() => expect(fetcher).toHaveBeenCalled());
      rerender();
      await waitFor(() => expect(result.current.getDataOptions('field')).toEqual([
        { value: 'bar', label: 'bar' },
        { value: 'foo', label: 'foo' },
      ]));
    });
  });

  describe('getDataOptionsWithFetching', () => {
    it('returns getDataOptions directly when no source is provided', () => {
      const { result } = renderHook(() => useDataOptions({}));

      const fetcher = jest.fn(() => fail('should not be called'));

      expect(result.current.getDataOptionsWithFetching('field', undefined)).toEqual([]);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('calls getParamsSource for non-org', async () => {
      const getParamsSource = jest.fn(() => Promise.resolve({ content: [] }));
      const { result } = renderHook(() => useDataOptions({ getParamsSource }));

      result.current.getDataOptionsWithFetching('field', { name: 'non-org' }, '', [], 'entity-type-id');

      expect(getParamsSource).toHaveBeenCalled();
    });

    it('calls getParamsSource for valueSourceApi when source is not provided', () => {
      const getParamsSource = jest.fn(() => Promise.resolve({ content: [] }));
      const { result } = renderHook(() => useDataOptions({ getParamsSource }));

      result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        'search-value',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      );

      expect(getParamsSource).toHaveBeenCalledWith({
        entityTypeId: 'entity-type-id',
        columnName: 'field',
        searchValue: 'search-value',
      });
    });

    it('returns failed marker when valueSourceApi fetch rejects', async () => {
      const getParamsSource = jest.fn(() => Promise.reject(new Error('request failed')));
      const { result } = renderHook(() => useDataOptions({ getParamsSource }));

      const promise = result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        'search-value',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      );

      await expect(promise).resolves.toMatchObject(DATA_OPTIONS_LOAD_FAILED);
      await waitFor(() => expect(isDataOptionsLoadFailure(result.current.getDataOptions('field', true))).toBe(true));
      expect(result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        'search-value',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      )).toMatchObject(DATA_OPTIONS_LOAD_FAILED);
      expect(getParamsSource).toHaveBeenCalledTimes(1);
    });

    it('retries failed valueSourceApi fetches when the search request changes', async () => {
      const retryValues = [{ value: 'retry-value', label: 'Retry value' }];
      const getParamsSource = jest.fn()
        .mockRejectedValueOnce(new Error('request failed'))
        .mockResolvedValueOnce({ content: retryValues });
      const { result } = renderHook(() => useDataOptions({ getParamsSource }));

      const failedPromise = result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        'failed-search',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      );

      await expect(failedPromise).resolves.toMatchObject(DATA_OPTIONS_LOAD_FAILED);
      await waitFor(() => expect(isDataOptionsLoadFailure(result.current.getDataOptions('field', true))).toBe(true));

      expect(result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        'failed-search',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      )).toMatchObject(DATA_OPTIONS_LOAD_FAILED);
      expect(getParamsSource).toHaveBeenCalledTimes(1);

      const retryPromise = result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        'retry-search',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      );

      await expect(retryPromise).resolves.toEqual(retryValues);
      expect(getParamsSource).toHaveBeenCalledTimes(2);
      expect(getParamsSource).toHaveBeenLastCalledWith({
        entityTypeId: 'entity-type-id',
        columnName: 'field',
        searchValue: 'retry-search',
      });
    });

    it('starts a new valueSourceApi fetch when the search request changes while another request is pending', async () => {
      const staleValues = [{ value: 'stale-value', label: 'Stale value' }];
      const freshValues = [{ value: 'fresh-value', label: 'Fresh value' }];
      const resolvers = {};
      const getParamsSource = jest.fn(({ searchValue }) => new Promise((resolve) => {
        resolvers[searchValue] = resolve;
      }));
      const { result } = renderHook(() => useDataOptions({ getParamsSource }));

      const stalePromise = result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        'stale-search',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      );

      await waitFor(() => expect(result.current.getDataOptions('field', true)).toBe(stalePromise));

      const freshPromise = result.current.getDataOptionsWithFetching(
        'field',
        undefined,
        '',
        [],
        'entity-type-id',
        { path: '/value-source-api' },
      );

      expect(getParamsSource).toHaveBeenCalledTimes(2);

      resolvers['']({ content: freshValues });
      await expect(freshPromise).resolves.toEqual(freshValues);
      await waitFor(() => expect(result.current.getDataOptions('field')).toEqual(freshValues));

      resolvers['stale-search']({ content: staleValues });
      await expect(stalePromise).resolves.toEqual(staleValues);
      await waitFor(() => expect(result.current.getDataOptions('field')).toEqual(freshValues));
    });

    it('uses source when both source and valueSourceApi are provided', () => {
      const getParamsSource = jest.fn(() => Promise.resolve({ content: [] }));
      const getOrganizations = jest.fn(() => Promise.resolve([]));
      const { result } = renderHook(() => useDataOptions({ getParamsSource, getOrganizations }));

      result.current.getDataOptionsWithFetching(
        'field',
        { name: ORGANIZATIONS_TYPES[0], columnName: 'name' },
        'search-value',
        ['org-id'],
        'entity-type-id',
        { path: '/value-source-api' },
      );

      expect(getOrganizations).toHaveBeenCalledWith(['org-id'], 'name');
      expect(getParamsSource).not.toHaveBeenCalled();
    });

    it('does not call getParamsSource for non-org when originalEntityTypeId is missing', async () => {
      const getParamsSource = jest.fn(() => Promise.resolve({ content: [] }));
      const { result } = renderHook(() => useDataOptions({ getParamsSource }));

      result.current.getDataOptionsWithFetching('field', { name: 'non-org' });

      expect(getParamsSource).not.toHaveBeenCalled();
    });

    it('calls getOrganizations for org source', async () => {
      const getOrganizations = jest.fn(() => Promise.resolve([]));
      const { result } = renderHook(() => useDataOptions({ getOrganizations }));

      result.current.getDataOptionsWithFetching('field', { name: ORGANIZATIONS_TYPES[0] }, '', ['a']);

      expect(getOrganizations).toHaveBeenCalled();
    });

    it('does not call getOrganizations for org source with usedIds=[]', async () => {
      const getOrganizations = jest.fn(() => fail('should not be called'));
      const { result } = renderHook(() => useDataOptions({ getOrganizations }));

      result.current.getDataOptionsWithFetching('field', { name: ORGANIZATIONS_TYPES[0] }, '', []);

      expect(getOrganizations).not.toHaveBeenCalled();
    });
  });
});
