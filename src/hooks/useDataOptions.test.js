import { renderHook, waitFor } from '@testing-library/react';
import { useDataOptions } from './useDataOptions';

describe('useDataOptions', () => {
  it('returns empty array for getting unknown fields', () => {
    const { result } = renderHook(() => useDataOptions());

    expect(result.current.getDataOptions('unknownField')).toEqual([]);
    expect(result.current.getDataOptions('unknownField', true)).toEqual([]);
  });

  it('sets with regular data', () => {
    const { result } = renderHook(() => useDataOptions());

    expect(result.current.getDataOptions('field')).toEqual([]);

    result.current.setDataOptions('field', ['foo']);

    expect(result.current.getDataOptions('field')).toEqual(['foo']);
  });

  it('only returns promises when requested', () => {
    const { result } = renderHook(() => useDataOptions());

    const promise = Promise.resolve(['foo']);

    result.current.setDataOptions('field', promise);

    expect(result.current.getDataOptions('field')).toEqual([]);
    expect(result.current.getDataOptions('field', true)).toEqual(promise);
  });

  it('does not call fetch promise if data already exists', () => {
    const { result } = renderHook(() => useDataOptions());

    const fetcher = jest.fn(() => fail('should not be called'));

    result.current.setDataOptions('field', ['foo']);

    result.current.getDataOptions('field', true, fetcher);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('calls fetch promise if data does not exist', async () => {
    const { result } = renderHook(() => useDataOptions());

    let resolver;
    const promise = new Promise((r) => {
      resolver = r;
    });
    const fetcher = jest.fn(() => promise);

    result.current.getDataOptions('field', true, fetcher);

    expect(fetcher).toHaveBeenCalled();
    expect(result.current.getDataOptions('field')).toEqual([]);
    expect(result.current.getDataOptions('field', true)).toEqual(promise);

    resolver(['foo']);

    // promise gets backfilled into the store as a non-async value once it's available
    await waitFor(() => expect(result.current.getDataOptions('field')).toEqual(['foo']));
  });
});
