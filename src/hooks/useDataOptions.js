import { useMemo, useRef } from 'react';

export function useDataOptions() {
  const dataOptions = useRef({});

  return useMemo(
    () => ({
      // helper methods to prevent redundant digging through our raw dataOptions
      getDataOptions: (field, allowPromises = false, fetchPromise = undefined) => {
        if (Array.isArray(dataOptions.current[field])) {
          return dataOptions.current[field];
        }

        // only return promises if requested, to prevent non-async code from exploding here
        if (typeof dataOptions.current[field] === 'object') {
          return allowPromises ? dataOptions.current[field] : [];
        }

        // if we're provided a fetcher, atomically set it here and automatically put its value back
        if (fetchPromise) {
          dataOptions.current[field] = fetchPromise();
          dataOptions.current[field].then(newValues => {
            dataOptions.current = {
              ...dataOptions.current,
              [field]: newValues,
            };
          });
        }

        return dataOptions.current[field] ?? [];
      },
      setDataOptions: (field, newValues) => {
        dataOptions.current = {
          ...dataOptions.current,
          [field]: newValues,
        };
      },
    }),
    [dataOptions.current],
  );
}
