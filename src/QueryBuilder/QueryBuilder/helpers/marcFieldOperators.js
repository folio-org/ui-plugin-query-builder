import { OPERATORS, getDiscreteOrTextOperators } from '../../../constants/operators';

// Mirrors lib-fqm-query-processor's MarcFieldFactory grammar for dynamic MARC field names, so the
// frontend can tell an indicator target (marc_245_ind1) apart from a subfield (marc_245_a) or a
// tag-only reference (marc_245) using nothing but the field's name. Control field tags (001-009)
// have no subfields/indicators and are excluded, matching the backend's isControlFieldTag check.
const MARC_CORE_PATTERNS = {
  subfield: /^marc_(\d{3})_([a-z0-9])$/i,
  dualIndicatorSubfield: /^marc_(\d{3})_ind1_(blank|[a-z0-9])_ind2_(blank|[a-z0-9])_([a-z0-9])$/i,
  constrainedSubfield: /^marc_(\d{3})_ind([12])_(blank|[a-z0-9])_([a-z0-9])$/i,
  constrainedIndicatorTarget: /^marc_(\d{3})_ind([12])_(blank|[a-z0-9])_ind([12])$/i,
  indicatorTarget: /^marc_(\d{3})_ind([12])$/i,
  tagOnly: /^marc_(\d{3})$/i,
};

const isControlFieldTag = (tag) => tag.startsWith('00');

const constrainedIndicator = (slot, constraintSlot, constraintValue) => (
  slot === constraintSlot ? { isTarget: false, value: constraintValue.toLowerCase() } : null
);

const targetIndicator = (slot, targetSlot) => (
  slot === targetSlot ? { isTarget: true, value: null } : null
);

/**
 * Parse a MARC field name (e.g. marc_245_ind1) into the {subfield, indicator1, indicator2}
 * shape consumed by isMarcIndicatorTarget/getMarcOperators, or null when the name doesn't
 * match the MARC field grammar. A composite entity type's source-alias prefix
 * (marc_bib.marc_245_a) is stripped before matching, same as the backend parser.
 *
 * @param {string} fieldName
 * @returns {{subfield: string|null, indicator1: object|null, indicator2: object|null}|null}
 */
export const parseMarcSelector = (fieldName) => {
  if (typeof fieldName !== 'string') {
    return null;
  }

  const lastDotIndex = fieldName.lastIndexOf('.');
  const core = lastDotIndex > 0 ? fieldName.slice(lastDotIndex + 1) : fieldName;

  let match = MARC_CORE_PATTERNS.subfield.exec(core);

  if (match && !isControlFieldTag(match[1])) {
    return { subfield: match[2].toLowerCase(), indicator1: null, indicator2: null };
  }

  match = MARC_CORE_PATTERNS.dualIndicatorSubfield.exec(core);
  if (match && !isControlFieldTag(match[1])) {
    return {
      subfield: match[4].toLowerCase(),
      indicator1: { isTarget: false, value: match[2].toLowerCase() },
      indicator2: { isTarget: false, value: match[3].toLowerCase() },
    };
  }

  match = MARC_CORE_PATTERNS.constrainedSubfield.exec(core);
  if (match && !isControlFieldTag(match[1])) {
    const [, , constraintSlot, constraintValue, subfield] = match;

    return {
      subfield: subfield.toLowerCase(),
      indicator1: constrainedIndicator('1', constraintSlot, constraintValue),
      indicator2: constrainedIndicator('2', constraintSlot, constraintValue),
    };
  }

  match = MARC_CORE_PATTERNS.constrainedIndicatorTarget.exec(core);
  if (match && !isControlFieldTag(match[1])) {
    const [, , constraintSlot, constraintValue, targetSlot] = match;

    if (constraintSlot !== targetSlot) {
      return {
        subfield: null,
        indicator1: constrainedIndicator('1', constraintSlot, constraintValue) || targetIndicator('1', targetSlot),
        indicator2: constrainedIndicator('2', constraintSlot, constraintValue) || targetIndicator('2', targetSlot),
      };
    }
  }

  match = MARC_CORE_PATTERNS.indicatorTarget.exec(core);
  if (match && !isControlFieldTag(match[1])) {
    const [, , targetSlot] = match;

    return {
      subfield: null,
      indicator1: targetIndicator('1', targetSlot),
      indicator2: targetIndicator('2', targetSlot),
    };
  }

  match = MARC_CORE_PATTERNS.tagOnly.exec(core);
  if (match) {
    return { subfield: null, indicator1: null, indicator2: null };
  }

  return null;
};

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
