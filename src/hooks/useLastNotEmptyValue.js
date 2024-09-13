import { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';

export const useLastNotEmptyValue = (value, defaultValue) => {
  const [lastNotEmptyValue, setLastNotEmptyValue] = useState(defaultValue);

  useEffect(() => {
    if (!isEmpty(value)) {
      setLastNotEmptyValue(value);
    }
  }, [value]);

  return lastNotEmptyValue;
};
