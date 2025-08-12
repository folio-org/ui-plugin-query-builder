import { renderHook, waitFor } from '@testing-library/react';
import { useDataOptions } from './useDataOptions';
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

      await waitFor(() =>
        expect(result.current.getDataOptions('field', false, fetcher)).toEqual(['foo']),
      );
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

      result.current.getDataOptions('field', true, () =>
        Promise.resolve([{ value: 'foo', label: 'foo' }]),
      );
      rerender();
      await waitFor(() =>
        expect(result.current.getDataOptions('field')).toEqual([{ value: 'foo', label: 'foo' }]),
      );

      const fetcher = jest.fn(() => Promise.resolve([{ value: 'bar', label: 'bar' }]));

      result.current.getDataOptions('field', true, fetcher, ['bar']);
      rerender();
      await waitFor(() => expect(fetcher).toHaveBeenCalled());
      rerender();
      await waitFor(() =>
        expect(result.current.getDataOptions('field')).toEqual([
          { value: 'bar', label: 'bar' },
          { value: 'foo', label: 'foo' },
        ]),
      );
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

      result.current.getDataOptionsWithFetching('field', { name: 'non-org' });

      expect(getParamsSource).toHaveBeenCalled();
    });

    it('calls getOrganizations for org source', async () => {
      const getOrganizations = jest.fn(() => Promise.resolve([]));
      const { result } = renderHook(() => useDataOptions({ getOrganizations }));

      result.current.getDataOptionsWithFetching('field', { name: ORGANIZATIONS_TYPES }, '', ['a']);

      expect(getOrganizations).toHaveBeenCalled();
    });

    it('does not call getOrganizations for org source with usedIds=[]', async () => {
      const getOrganizations = jest.fn(() => fail('should not be called'));
      const { result } = renderHook(() => useDataOptions({ getOrganizations }));

      result.current.getDataOptionsWithFetching('field', { name: ORGANIZATIONS_TYPES }, '', []);

      expect(getOrganizations).not.toHaveBeenCalled();
    });
  });
});
