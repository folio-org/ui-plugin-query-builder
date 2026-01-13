import { useCallback, useState } from 'react';
import { formattedLanguageName } from '@folio/stripes/components';
import { useIntl } from 'react-intl';
import { ORGANIZATIONS_TYPES } from '../constants/dataTypes';

function getUniqueValues(a, b) {
  const uniqueValues = new Map();

  a.forEach((item) => uniqueValues.set(item.value, item));
  b.forEach((item) => uniqueValues.set(item.value, item));

  return Array.from(uniqueValues.values()).toSorted((aa, bb) => aa.label.localeCompare(bb.label));
}

export function useDataOptions({ getParamsSource, getOrganizations }) {
  const intl = useIntl();
  const [dataOptions, setDataOptions] = useState({});

  const formatLanguageOptions = useCallback((data, shouldFormat) => {
    if (!shouldFormat || !Array.isArray(data)) {
      return data;
    }

    return data.map((item) => ({
      value: item.value,
      label: formattedLanguageName(item.value, intl),
    }));
  }, [intl]);

  // helper methods to prevent redundant digging through our raw dataOptions
  const getDataOptions = useCallback(
    (
      field,
      allowPromises = false,
      fetchPromise = undefined,
      fetchIfValuesMissing = [],
      shouldFormatLanguages = false,
    ) => {
      if (
        Array.isArray(dataOptions[field]) &&
                // check that all specially requested values are present
                fetchIfValuesMissing.every((v) => !!dataOptions[field].find((o) => o.value === v))
      ) {
        return formatLanguageOptions(dataOptions[field], shouldFormatLanguages);
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

      return formatLanguageOptions(dataOptions[field] ?? [], shouldFormatLanguages);
    },
    [dataOptions, formatLanguageOptions],
  );

  const getDataOptionsWithFetching = useCallback(
    // usedIds are only for organization sources
    // `originalEntityTypeId` is the entityTypeId the user is building the query against
    (fieldName, source, searchValue, usedIds, originalEntityTypeId) => {
      const isLanguageField = source?.columnName === 'languages';

      if (!source) {
        return getDataOptions(fieldName, false, undefined, [], isLanguageField);
      } else if (ORGANIZATIONS_TYPES.includes(source.name)) {
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
          isLanguageField,
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
          isLanguageField,
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
