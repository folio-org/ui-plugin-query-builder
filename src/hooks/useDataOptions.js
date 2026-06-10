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

const isPendingOrFailedOptions = (options) => (
  typeof options === 'object' && !Array.isArray(options)
);

const shouldUseCachedOptions = (options, fetchPromise, requestKey) => (
  isPendingOrFailedOptions(options) &&
  (!fetchPromise || !requestKey || options.requestKey === requestKey)
);

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

      if (
        Array.isArray(cachedOptions) &&
                // check that all specially requested values are present
                fetchIfValuesMissing.every((v) => !!cachedOptions.find((o) => o.value === v))
      ) {
        return cachedOptions;
      }

      // only return promises/failures if requested, to prevent non-async code from exploding here
      // we don't need to worry about fetchIfValuesMissing here as we will re-render once this promise is resolved,
      // and any missing ones will then be checked
      if (shouldUseCachedOptions(cachedOptions, fetchPromise, requestKey)) {
        return allowPromises ? cachedOptions : [];
      }

      // if we're provided a fetcher, atomically set it here and automatically put its value back
      if (fetchPromise) {
        const existingValues = Array.isArray(cachedOptions) ? cachedOptions : [];
        const promise = fetchPromise()
          .then((newValues) => (Array.isArray(newValues)
            ? getUniqueValues(existingValues, newValues)
            : getDataOptionsLoadFailure(requestKey)))
          .catch(() => getDataOptionsLoadFailure(requestKey));

        promise.requestKey = requestKey;

        setDataOptions((prev) => ({
          ...prev,
          [field]: promise,
        }));

        promise.then((newValues) => {
          setDataOptions((prev) => (prev[field] === promise
            ? {
              ...prev,
              [field]: newValues,
            }
            : prev));
        });

        return promise;
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
            : async () => {
              // API calls get fussy when packing too many orgs into one URL
              const buckets = [];

              for (let i = 0; i < usedIds.length; i += 50) {
                buckets.push(usedIds.slice(i, i + 50));
              }

              const results = await Promise.all(
                buckets.map((bucket) => getOrganizations(bucket, source.columnName)),
              );

              return results.flat();
            },
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
