import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

import { RootContext } from '../../../context/RootContext';
import { useDataOptions } from '../../../hooks/useDataOptions';
import { useQueryStr } from './query';

jest.mock('../../../hooks/useTenantTimezone', () => {
  return () => ({ tenantTimezone: 'UTC' });
});

const ORG_LABELS = {
  'org-a': 'Vendor A',
  'org-b': 'Vendor B',
};

const orgEntityType = {
  id: 'entity-type-id',
  columns: [
    {
      name: 'vendor_id',
      labelAlias: 'Vendor',
      queryable: true,
      visibleByDefault: true,
      dataType: { dataType: 'stringType' },
      source: { name: 'organization', columnName: 'name' },
    },
  ],
};

// Two rows on the same organization-backed field, each with a different id. This is the shape
// that used to make the viewer flash raw ids: the second row was handed the first row's pending
// fetch and resolved before its own id was known.
const twoRowsSameFieldQuery = {
  $and: [
    { vendor_id: { $eq: 'org-a' } },
    { vendor_id: { $eq: 'org-b' } },
  ],
};

// Resolves on a real timer so the hook's async runs overlap the same way they do in the browser.
const createDelayedGetOrganizations = (delayMs = 10) => jest.fn(async (ids) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return ids.map((id) => ({ value: id, label: ORG_LABELS[id] }));
});

// Uses the real value-options cache so the test exercises the actual fetch/cache interplay.
const createCacheWrapper = (getOrganizations) => function CacheWrapper({ children }) {
  const dataOptions = useDataOptions({ getParamsSource: jest.fn(), getOrganizations });

  return (
    <RootContext.Provider value={dataOptions}>
      {children}
    </RootContext.Provider>
  );
};

const flushPendingWork = () => act(() => new Promise((resolve) => setTimeout(resolve, 100)));

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

    await waitFor(() => expect(result.current).toBe(''));
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
    expect(result.current.type?.name).toBe('Loading');
  });

  describe('resolving ids to labels', () => {
    it('keeps showing the loader until every id is resolved, then publishes only the final query', async () => {
      const getOrganizations = createDelayedGetOrganizations();
      const published = [];

      const { result } = renderHook(
        () => {
          const value = useQueryStr(orgEntityType, { fqlQuery: twoRowsSameFieldQuery });

          published.push(value);

          return value;
        },
        { wrapper: createCacheWrapper(getOrganizations) },
      );

      await waitFor(() => expect(typeof result.current).toBe('string'));
      await flushPendingWork();

      const publishedStrings = [...new Set(published.filter((value) => typeof value === 'string'))];

      // The loader is what the user sees first; the string only appears once it is final.
      expect(React.isValidElement(published[0])).toBe(true);
      expect(publishedStrings).toHaveLength(1);
      expect(publishedStrings[0]).toContain('Vendor A');
      expect(publishedStrings[0]).toContain('Vendor B');
      expect(publishedStrings[0]).not.toContain('org-a');
      expect(publishedStrings[0]).not.toContain('org-b');
    });

    it('fetches each source-backed field once for the whole query', async () => {
      const getOrganizations = createDelayedGetOrganizations();

      const { result } = renderHook(
        () => useQueryStr(orgEntityType, { fqlQuery: twoRowsSameFieldQuery }),
        { wrapper: createCacheWrapper(getOrganizations) },
      );

      await waitFor(() => expect(typeof result.current).toBe('string'));
      await flushPendingWork();

      expect(getOrganizations).toHaveBeenCalledTimes(1);
      expect(getOrganizations).toHaveBeenCalledWith(['org-a', 'org-b'], 'name');
    });

    it('does not go back to the loader when an equal fqlQuery object is passed again', async () => {
      const getOrganizations = createDelayedGetOrganizations();
      const published = [];

      const { result, rerender } = renderHook(
        ({ fqlQuery }) => {
          const value = useQueryStr(orgEntityType, { fqlQuery });

          published.push(value);

          return value;
        },
        {
          wrapper: createCacheWrapper(getOrganizations),
          initialProps: { fqlQuery: twoRowsSameFieldQuery },
        },
      );

      await waitFor(() => expect(typeof result.current).toBe('string'));
      await flushPendingWork();

      const publishedBeforeRerender = published.length;

      // Same query content, new object identity - the way a host may re-derive props on every render.
      rerender({ fqlQuery: JSON.parse(JSON.stringify(twoRowsSameFieldQuery)) });
      await flushPendingWork();

      const publishedAfterRerender = published.slice(publishedBeforeRerender);

      expect(publishedAfterRerender.every((value) => typeof value === 'string')).toBe(true);
      expect(getOrganizations).toHaveBeenCalledTimes(1);
    });

    it('publishes an empty query instead of a permanent loader when the query cannot be parsed', async () => {
      const getOrganizations = createDelayedGetOrganizations();

      const { result } = renderHook(
        // null is not a valid condition; resolution throws while parsing it
        () => useQueryStr(orgEntityType, { fqlQuery: { $and: [null] } }),
        { wrapper: createCacheWrapper(getOrganizations) },
      );

      await waitFor(() => expect(result.current).toBe(''));
      expect(getOrganizations).not.toHaveBeenCalled();
    });

    describe('when the query changes while the same field is still being fetched', () => {
      const firstQuery = { vendor_id: { $eq: 'org-a' } };

      it.each([
        ['$eq', { vendor_id: { $eq: 'org-b' } }],
        ['$in', { vendor_id: { $in: ['org-b'] } }],
      ])('resolves the new %s query to labels by fetching the id the pending request did not cover', async (_, nextQuery) => {
        const getOrganizations = createDelayedGetOrganizations(30);

        const { result, rerender } = renderHook(
          ({ fqlQuery }) => useQueryStr(orgEntityType, { fqlQuery }),
          {
            wrapper: createCacheWrapper(getOrganizations),
            initialProps: { fqlQuery: firstQuery },
          },
        );

        // The first run has started its fetch for org-a and is still waiting on it.
        await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
        rerender({ fqlQuery: nextQuery });

        await waitFor(() => expect(typeof result.current).toBe('string'));
        await flushPendingWork();

        expect(result.current).toContain('Vendor B');
        expect(result.current).not.toContain('org-b');
        expect(getOrganizations.mock.calls.map(([ids]) => ids)).toEqual([['org-a'], ['org-b']]);
      });
    });
  });
});
