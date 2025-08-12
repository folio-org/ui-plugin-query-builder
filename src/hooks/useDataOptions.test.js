import { renderHook, waitFor } from '@testing-library/react';
import { useDataOptions } from './useDataOptions';

describe('useDataOptions', () => {
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
});
