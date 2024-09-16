import { useEffect, useState } from 'react';
import { isEmpty, isNumber } from 'lodash';

export const useLastNotEmptyValue = (value, defaultValue) => {
  const [lastNotEmptyValue, setLastNotEmptyValue] = useState(defaultValue);

  const isNotEmptyObject = !isEmpty(value)
  const isPositiveNumber = isNumber(value) && value > 0;

  useEffect(() => {
    if (isNotEmptyObject || isPositiveNumber) {
      setLastNotEmptyValue(value);
    }
  }, [value]);

  return lastNotEmptyValue;
};
