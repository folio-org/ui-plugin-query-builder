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
  CONTAINS_ALL: 'contains all',
  NOT_CONTAINS_ALL: 'not contains all',
  CONTAINS_ANY: 'contains any',
  NOT_CONTAINS_ANY: 'not contains any',
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
  GREATER_THAN: 'greater than',
  LESS_THAN: 'less than',
  GREATER_THAN_OR_EQUAL: 'greater than or equal to',
  LESS_THAN_OR_EQUAL: 'less than or equal to',
  IN: 'in',
  NOT_IN: 'not in',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not contains',
  CONTAINS_ALL: 'contains all',
  NOT_CONTAINS_ALL: 'not contains all',
  CONTAINS_ANY: 'contains any',
  NOT_CONTAINS_ANY: 'not contains any',
  STARTS_WITH: 'starts with',
  EMPTY: ' is null/empty',
};

export const OPERATOR_GROUPS = {
  like: [OPERATORS.CONTAINS, OPERATORS.STARTS_WITH],
  comparison: [
    OPERATORS.EQUAL,
    OPERATORS.NOT_EQUAL,
    OPERATORS.GREATER_THAN,
    OPERATORS.LESS_THAN,
    OPERATORS.GREATER_THAN_OR_EQUAL,
    OPERATORS.LESS_THAN_OR_EQUAL,
  ],
  null: [OPERATORS.EMPTY],
  arrayComparison: [
    OPERATORS.IN,
    OPERATORS.NOT_IN,
    OPERATORS.CONTAINS_ALL,
    OPERATORS.CONTAINS_ANY,
    OPERATORS.NOT_CONTAINS_ANY,
    OPERATORS.NOT_CONTAINS_ALL,
    OPERATORS.NOT_CONTAINS,
  ],
};

export const OPERATORS_GROUPS_NAME = {
  ARRAY_COMPARISON: 'arrayComparison',
  COMPARISON: 'comparison',
  LIKE: 'like',
  NULL: 'null',
};
