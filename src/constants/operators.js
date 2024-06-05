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

export const BOOLEAN_OPERATORS_MAP = {
  [BOOLEAN_OPERATORS.AND]: 'AND',
};

export const OPERATORS_LABELS = {
  EQUAL: 'equals',
  NOT_EQUAL: 'not equal to',
};
