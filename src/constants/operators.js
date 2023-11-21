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
  STARTS_WITH: 'starts with',
};

export const BOOLEAN_OPERATORS = {
  AND: '$and',
};

export const BOOLEAN_OPERATORS_MAP = {
  [BOOLEAN_OPERATORS.AND]: 'AND',
};
