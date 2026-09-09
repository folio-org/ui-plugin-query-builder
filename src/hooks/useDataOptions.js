import { useCallback, useState } from 'react';
import { ORGANIZATIONS_TYPES } from '../constants/dataTypes';

export const DATA_OPTIONS_LOAD_FAILED = Object.freeze({ dataOptionsLoadFailed: true });

export const isDataOptionsLoadFailure = (options) => Boolean(options?.dataOptionsLoadFailed);

const getRequestKey = (request) => JSON.stringify(request);

const getDataOptionsLoadFailure = (requestKey) => ({
  ...DATA_OPTIONS_LOAD_FAILED,
  requestKey,
});

function getUniqueValues(a, b) {
  const uniqueValues = new Map();

  a.forEach((item) => uniqueValues.set(item.value, item));
  b.forEach((item) => uniqueValues.set(item.value, item));

  return Array.from(uniqueValues.values()).toSorted((aa, bb) => aa.label.localeCompare(bb.label));
}

const hasAllValues = (options, values) => values.every((v) => options.some((o) => o.value === v));

const isPendingOrFailedOptions = (options) => (
  typeof options === 'object' && !Array.isArray(options)
);

const shouldUseCachedOptions = (options, fetchPromise, requestKey) => (
  isPendingOrFailedOptions(options) &&
  (!isDataOptionsLoadFailure(options) || !fetchPromise || options.requestKey === requestKey)
);

// API calls get fussy when packing too many orgs into one URL, so ask for them in buckets
const fetchOrganizationsInBatches = async (getOrganizations, usedIds, columnName) => {
  const buckets = [];

  for (let i = 0; i < usedIds.length; i += 50) {
    buckets.push(usedIds.slice(i, i + 50));
  }

  const results = await Promise.all(
    buckets.map((bucket) => getOrganizations(bucket, columnName)),
  );

  return results.flat();
};

const publishFieldOptions = (setDataOptions, field, options) => {
  setDataOptions((prev) => ({
    ...prev,
    [field]: options,
  }));
};

// Starts the fetch, publishes its promise to the cache, and puts the settled value back once it lands.
const startFieldFetch = ({
  setDataOptions,
  field,
  fetchPromise,
  requestKey,
  existingValues,
}) => {
  const promise = fetchPromise()
    .then((newValues) => (Array.isArray(newValues)
      ? getUniqueValues(existingValues, newValues)
      : getDataOptionsLoadFailure(requestKey)))
    .catch(() => getDataOptionsLoadFailure(requestKey));

  publishFieldOptions(setDataOptions, field, promise);
  promise.then((newValues) => publishFieldOptions(setDataOptions, field, newValues));

  return promise;
};

export function useDataOptions({ getParamsSource, getOrganizations }) {
  const [dataOptions, setDataOptions] = useState({});

  // helper methods to prevent redundant digging through our raw dataOptions
  const getDataOptions = useCallback(
    (
      field,
      allowPromises = false,
      fetchPromise = undefined,
      fetchIfValuesMissing = [],
      requestKey = undefined,
    ) => {
      const cachedOptions = dataOptions[field];

      // check that all specially requested values are present
      if (Array.isArray(cachedOptions) && hasAllValues(cachedOptions, fetchIfValuesMissing)) {
        return cachedOptions;
      }

      const startFetch = (existingValues) => startFieldFetch({
        setDataOptions,
        field,
        fetchPromise,
        requestKey,
        existingValues,
      });

      // only return promises/failures if requested, to prevent non-async code from exploding here
      if (shouldUseCachedOptions(cachedOptions, fetchPromise, requestKey)) {
        if (!allowPromises) {
          return [];
        }

        // A pending fetch was started for whichever ids were asked for first, so it may not carry the ids this
        // caller needs. Wait for it, then fetch only what it left uncovered, merging into the settled options.
        // Callers that resolve once (the viewer query string) rely on this instead of re-running on cache writes.
        if (fetchPromise && fetchIfValuesMissing.length && typeof cachedOptions?.then === 'function') {
          return cachedOptions.then((settledOptions) => (
            Array.isArray(settledOptions) && !hasAllValues(settledOptions, fetchIfValuesMissing)
              ? startFetch(settledOptions)
              : settledOptions
          ));
        }

        return cachedOptions;
      }

      // if we're provided a fetcher, atomically set it here and automatically put its value back
      if (fetchPromise) {
        return startFetch(Array.isArray(cachedOptions) ? cachedOptions : []);
      }

      return cachedOptions ?? [];
    },
    [dataOptions],
  );

  const getDataOptionsWithFetching = useCallback(
    // usedIds are only for organization sources
    // `originalEntityTypeId` is the entityTypeId the user is building the query against
    (fieldName, source, searchValue, usedIds = [], originalEntityTypeId, valueSourceApi) => {
      if (!source && !valueSourceApi) {
        return getDataOptions(fieldName);
      } else if (source && ORGANIZATIONS_TYPES.includes(source.name)) {
        return getDataOptions(
          fieldName,
          true,
          !usedIds.length
            ? undefined
            : () => fetchOrganizationsInBatches(getOrganizations, usedIds, source.columnName),
          usedIds,
          getRequestKey({
            source: source.name,
            columnName: source.columnName,
            usedIds,
          }),
        );
      } else {
        // If the entityType isn't known yet, don't attempt value fetching
        if (!originalEntityTypeId) {
          return [];
        }

        return getDataOptions(
          fieldName,
          true,
          () => getParamsSource({
            entityTypeId: originalEntityTypeId,
            columnName: fieldName,
            searchValue,
          }).then((data) => data?.content),
          [],
          getRequestKey({
            entityTypeId: originalEntityTypeId,
            columnName: fieldName,
            searchValue,
          }),
        );
      }
    },
    [getDataOptions, getParamsSource, getOrganizations],
  );

  return {
    getDataOptions,
    getDataOptionsWithFetching,
  };
}
