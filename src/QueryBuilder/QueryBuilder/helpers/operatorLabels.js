import { BOOLEAN_OPERATORS, OPERATORS } from '../../../constants/operators';

// Maps an operator *value* (e.g. '==') back to its enum key (e.g. 'EQUAL'),
// so we can resolve the matching `operators.<KEY>` translation.
export const OPERATOR_VALUE_TO_KEY = Object.fromEntries(
  Object.entries(OPERATORS).map(([key, value]) => [value, key]),
);

// Translation id for the boolean operator (uses the raw value, e.g. '$and').
const BOOLEAN_OPERATOR_TRANSLATION_ID = {
  [BOOLEAN_OPERATORS.AND]: 'ui-plugin-query-builder.operators.boolean.$and',
};

// Shared resolver. `keyPrefix` selects the label set:
//   'operators'        -> verbose words   (e.g. 'greater than'), used by the dropdown
//   'operators.symbol' -> compact form    (e.g. '>'),           used by the user-friendly query
const resolveOperatorLabel = (operatorValue, intl, keyPrefix) => {
  const key = OPERATOR_VALUE_TO_KEY[operatorValue];

  if (!key) return operatorValue;

  return intl.formatMessage({ id: `ui-plugin-query-builder.${keyPrefix}.${key}` });
};

/**
 * Verbose, human-friendly operator label for the query builder dropdown
 * (e.g. 'greater than'). Falls back to the raw value if no key is found.
 *
 * @param {string} operatorValue e.g. '==', 'in', '>='
 * @param {object} intl react-intl instance
 */
export const getOperatorLabel = (operatorValue, intl) => (
  resolveOperatorLabel(operatorValue, intl, 'operators')
);

/**
 * Compact operator label for the user-friendly query (e.g. '>'). Comparison
 * operators render as glyphs, set/null operators as words.
 */
export const getOperatorSymbol = (operatorValue, intl) => (
  resolveOperatorLabel(operatorValue, intl, 'operators.symbol')
);

/**
 * Resolves the localized label for a boolean operator value (e.g. '$and').
 */
export const getBooleanOperatorLabel = (booleanValue, intl) => {
  const id = BOOLEAN_OPERATOR_TRANSLATION_ID[booleanValue];

  return id ? intl.formatMessage({ id }) : booleanValue;
};
