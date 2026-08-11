export const OPERATORS = {
  EQUAL: '==',
  NOT_EQUAL: '!=',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_THAN_OR_EQUAL: '>=',
  LESS_THAN_OR_EQUAL: '<=',
  IN: 'in',
  NOT_IN: 'not in',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not contains',
  STARTS_WITH: 'starts with',
  EMPTY: ' is null/empty',
};

export const BOOLEAN_OPERATORS = {
  AND: '$and',
};

// Shared eq/ne + (in/nin for a discrete/fixed set of values, or contains/starts_with for free
// text) + empty shape, reused by any dataType that makes this same discrete-vs-free-text split
// (e.g. StringType via hasSourceOrValues, MarcType via isMarcIndicatorTarget).
export const getDiscreteOrTextOperators = (isDiscrete) => [
  OPERATORS.EQUAL,
  OPERATORS.NOT_EQUAL,
  ...(isDiscrete ? [OPERATORS.IN, OPERATORS.NOT_IN] : [OPERATORS.CONTAINS, OPERATORS.STARTS_WITH]),
  OPERATORS.EMPTY,
];