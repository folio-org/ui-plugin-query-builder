import { OPERATORS, getDiscreteOrTextOperators } from '../../../constants/operators';

/**
 * True when the MARC selector's query target is an indicator (a single coded character,
 * e.g. marc_245_ind1) rather than a subfield or the whole tag. An indicator target behaves
 * like a discrete/fixed value -- the same split StringType makes via hasSourceOrValues -- so
 * it gets eq/ne/in/nin instead of eq/ne/contains/starts_with.
 *
 * @param {object} marcSelector
 * @param {string|null} [marcSelector.subfield] subfield code, if selected
 * @param {{isTarget: boolean, value: string|null}|null} [marcSelector.indicator1]
 * @param {{isTarget: boolean, value: string|null}|null} [marcSelector.indicator2]
 * @returns {boolean}
 */
export const isMarcIndicatorTarget = (marcSelector = {}) => {
  const { subfield, indicator1, indicator2 } = marcSelector;

  if (subfield) {
    return false;
  }

  return Boolean(indicator1?.isTarget) || Boolean(indicator2?.isTarget);
};

// An indicator always holds a defined code (or the blank code) -- unlike a free-text subfield/tag,
// there's no "empty" state to query, so the empty operator is dropped for indicator targets.
export const getMarcOperators = (marcSelector) => {
  const isIndicatorTarget = isMarcIndicatorTarget(marcSelector);
  const operators = getDiscreteOrTextOperators(isIndicatorTarget);

  return isIndicatorTarget ? operators.filter((operator) => operator !== OPERATORS.EMPTY) : operators;
};
