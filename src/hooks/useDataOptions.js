import { useCallback, useMemo, useState } from 'react';
import { ORGANIZATIONS_TYPES } from '../constants/dataTypes';

function getUniqueValues(a, b) {
  const uniqueValues = new Map();

  a.forEach((item) => uniqueValues.set(item.value, item));
  b.forEach((item) => uniqueValues.set(item.value, item));

  return Array.from(uniqueValues.values()).toSorted((aa, bb) => aa.label.localeCompare(bb.label));
}

export function useDataOptions({ getParamsSource, getOrganizations }) {
  const [dataOptions, setDataOptions] = useState({});

  // helper methods to prevent redundant digging through our raw dataOptions
  const getDataOptions = useCallback(
    (field, allowPromises = false, fetchPromise = undefined, fetchIfValuesMissing = []) => {
      if (
        Array.isArray(dataOptions[field]) &&
        // check that all specially requested values are present
        fetchIfValuesMissing.every((v) => !!dataOptions[field].find((o) => o.value === v))
      ) {
        return dataOptions[field];
      }

      // only return promises if requested, to prevent non-async code from exploding here
      // we don't need to worry about fetchIfValuesMissing here as we will re-render once this promise is resolved,
      // and any missing ones will then be checked
      if (typeof dataOptions[field] === 'object' && !Array.isArray(dataOptions[field])) {
        return allowPromises ? dataOptions[field] : [];
      }

      // if we're provided a fetcher, atomically set it here and automatically put its value back
      if (fetchPromise) {
        const existingValues = dataOptions[field] ?? [];

        const promise = fetchPromise();

        setDataOptions((prev) => ({
          ...prev,
          [field]: promise,
        }));

        promise.then((newValues) => {
          setDataOptions((prev) => ({
            ...prev,
            [field]: getUniqueValues(existingValues, newValues),
          }));
        });

        return promise;
      }

      return dataOptions[field] ?? [];
    },
    [dataOptions],
  );

  const getDataOptionsWithFetching = useCallback(
    // usedIds are only for organization sources
    (fieldName, source, searchValue, usedIds) => {
      if (!source) {
        return getDataOptions(fieldName);
      } else if (source.name === ORGANIZATIONS_TYPES) {
        return getDataOptions(
          fieldName,
          true,
          !usedIds.length ? undefined : () => getOrganizations(usedIds, source.columnName),
          usedIds,
        );
      } else {
        return getDataOptions(fieldName, true, () => getParamsSource({
          entityTypeId: source?.entityTypeId,
          columnName: source?.columnName,
          searchValue,
        }).then((data) => data?.content));
      }
    },
    [getDataOptions],
  );

  return {
    getDataOptions,
    getDataOptionsWithFetching,
  };
}
