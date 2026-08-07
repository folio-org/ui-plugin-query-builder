import { OPERATORS, getDiscreteOrTextOperators } from '../../../constants/operators';
import { isMarcIndicatorTarget } from './marcFields';

// Operator set for a MARC field, derived from its name. An indicator target holds a coded value (blank or 0-9), so
// it behaves like a discrete/fixed field -- eq/ne/in/nin; a subfield or whole-tag target is free text --
// eq/ne/contains/starts_with/empty. (Indicators drop empty: a coded position is never absent.)
export const getMarcOperators = (fieldName) => {
  const isIndicatorTarget = isMarcIndicatorTarget(fieldName);
  const operators = getDiscreteOrTextOperators(isIndicatorTarget);

  return isIndicatorTarget ? operators.filter((operator) => operator !== OPERATORS.EMPTY) : operators;
};
