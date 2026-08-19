import { DATA_TYPES } from '../../../constants/dataTypes';

// A MARC field is referenced by name (e.g. marc_245_a), not enumerated as a column. These helpers assemble a
// canonical field name from the picker's state and parse one back (for editing a saved query). The grammar
// mirrors the backend (lib-fqm-query-processor MarcFieldFactory); ind1 always precedes ind2 in the canonical
// form when both are constraints.

export const MARC_DATA_TYPE = DATA_TYPES.MarcType;
export const MARC_BLANK_INDICATOR = 'blank';

export const MARC_INDICATOR_VALUES = [MARC_BLANK_INDICATOR, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Sentinel used as the field-dropdown option value for "MARC field". Selecting it puts the row into MARC mode,
// where MarcFieldControl builds the real field name. It's never sent to the backend.
export const MARC_FIELD_SENTINEL = '__marcField__';

export const MARC_VALUE_DATA_TYPE = DATA_TYPES.StringType;

// The generic MARC placeholder column ('marc', or '<source>.marc' on a composite). Its presence is what marks
// an entity type as MARC-capable.
export const findMarcPlaceholder = (columns = []) => {
  return columns.find((column) => column?.dataType?.dataType === MARC_DATA_TYPE) ?? null;
};

// The source-alias prefix a synthesized MARC field must carry, derived from the placeholder name:
// 'marc' -> '' (simple ET); 'marc_bib.marc' -> 'marc_bib.' (composite).
export const getMarcSourcePrefix = (placeholderName = '') => (placeholderName.endsWith('marc') ? placeholderName.slice(0, -'marc'.length) : '');

// MARC control fields (tags 00X) have no indicators or subfields — only the whole-tag form is valid. Mirrors the
// backend rule (tag starts with "00").
export const isControlFieldTag = (tag) => typeof tag === 'string' && tag.startsWith('00');

// Which part of the field the query condition applies to — the part the operator and value cell act on. The
// other parts act as fixed constraints that narrow which field occurrences match.
export const MARC_TARGETS = {
  TAG: 'tag',
  SUBFIELD: 'subfield',
  IND1: 'ind1',
  IND2: 'ind2',
};

const TAG = String.raw`\d{3}`;
const SUBFIELD = '[a-z0-9]';
const IND_VALUE = `${MARC_BLANK_INDICATOR}|[a-z0-9]`;

// Indicator-target form (one indicator constrained, the other targeted). The two indicators must differ.
const buildIndicatorTarget = (groups, base) => {
  if (groups.constraintInd === groups.targetInd) return null;

  const targetKey = groups.targetInd === '1' ? MARC_TARGETS.IND1 : MARC_TARGETS.IND2;
  const constraintKey = groups.constraintInd === '1' ? 'ind1' : 'ind2';

  return { ...base, target: targetKey, [constraintKey]: groups.val.toLowerCase() };
};

const PATTERNS = [
  {
    re: new RegExp(`^marc_(?<tag>${TAG})$`, 'i'),
    build: (groups, base) => ({ ...base, target: MARC_TARGETS.TAG }),
  },
  {
    re: new RegExp(`^marc_(?<tag>${TAG})_(?<subfield>${SUBFIELD})$`, 'i'),
    build: (groups, base) => ({ ...base, target: MARC_TARGETS.SUBFIELD, subfield: groups.subfield.toLowerCase() }),
  },
  {
    re: new RegExp(`^marc_(?<tag>${TAG})_ind(?<ind>[12])$`, 'i'),
    build: (groups, base) => ({ ...base, target: groups.ind === '1' ? MARC_TARGETS.IND1 : MARC_TARGETS.IND2 }),
  },
  {
    re: new RegExp(`^marc_(?<tag>${TAG})_ind(?<ind>[12])_(?<val>${IND_VALUE})_(?<subfield>${SUBFIELD})$`, 'i'),
    build: (groups, base) => ({
      ...base,
      target: MARC_TARGETS.SUBFIELD,
      subfield: groups.subfield.toLowerCase(),
      [groups.ind === '1' ? 'ind1' : 'ind2']: groups.val.toLowerCase(),
    }),
  },
  {
    re: new RegExp(
      `^marc_(?<tag>${TAG})_ind1_(?<ind1>${IND_VALUE})_ind2_(?<ind2>${IND_VALUE})_(?<subfield>${SUBFIELD})$`,
      'i',
    ),
    build: (groups, base) => ({
      ...base,
      target: MARC_TARGETS.SUBFIELD,
      subfield: groups.subfield.toLowerCase(),
      ind1: groups.ind1.toLowerCase(),
      ind2: groups.ind2.toLowerCase(),
    }),
  },
  {
    // Constrained field, no subfield (marc_245_ind1_0): the whole field narrowed to occurrences whose indicator
    // is fixed. The tag value is the target (not the indicator), so it behaves like a value field.
    re: new RegExp(`^marc_(?<tag>${TAG})_ind(?<ind>[12])_(?<val>${IND_VALUE})$`, 'i'),
    build: (groups, base) => ({
      ...base,
      target: MARC_TARGETS.TAG,
      [groups.ind === '1' ? 'ind1' : 'ind2']: groups.val.toLowerCase(),
    }),
  },
  {
    // Two indicators constrained, no subfield (marc_245_ind1_1_ind2_2): whole field with both indicators fixed.
    re: new RegExp(`^marc_(?<tag>${TAG})_ind1_(?<ind1>${IND_VALUE})_ind2_(?<ind2>${IND_VALUE})$`, 'i'),
    build: (groups, base) => ({
      ...base,
      target: MARC_TARGETS.TAG,
      ind1: groups.ind1.toLowerCase(),
      ind2: groups.ind2.toLowerCase(),
    }),
  },
  {
    re: new RegExp(`^marc_(?<tag>${TAG})_ind(?<constraintInd>[12])_(?<val>${IND_VALUE})_ind(?<targetInd>[12])$`, 'i'),
    build: buildIndicatorTarget,
  },
];

// A control field (00X) is only valid as the bare tag: the tag itself is the target, with no subfield and no
// indicator constraints. Note the new constrained-field forms are also target=TAG, so the guard can't key off
// target alone — it must check that no subfield/indicator is present.
const isPlainTag = (parsed) => (
  parsed.target === MARC_TARGETS.TAG && parsed.subfield === null && parsed.ind1 === null && parsed.ind2 === null
);

/**
 * Parse a MARC field name into picker state, or null if it isn't a MARC field name.
 * Shape: { sourcePrefix, tag, target, subfield, ind1, ind2 } where ind1/ind2 are constraint values (or null),
 * and for an indicator target the targeted indicator carries no value.
 */
export function parseMarcFieldName(name) {
  if (typeof name !== 'string') return null;

  const lastDot = name.lastIndexOf('.');
  const sourcePrefix = lastDot >= 0 ? name.slice(0, lastDot + 1) : '';
  const core = lastDot >= 0 ? name.slice(lastDot + 1) : name;

  const hit = PATTERNS
    .map(({ build, re }) => ({ build, match: re.exec(core) }))
    .find(({ match }) => Boolean(match));

  if (!hit) return null;

  const groups = hit.match.groups;
  const result = hit.build(groups, { sourcePrefix, tag: groups.tag, subfield: null, ind1: null, ind2: null });

  // Control fields (00X) have no subfields or indicators — only the bare tag is valid, so reject any subfield or
  // indicator form on a control tag (marc_008_a, marc_008_ind1, marc_008_ind1_0). Keeps the grammar authoritative.
  if (result && isControlFieldTag(result.tag) && !isPlainTag(result)) {
    return null;
  }

  return result;
}

export const isMarcFieldName = (name) => parseMarcFieldName(name) !== null;

// True when the field name targets an indicator, as opposed to a subfield or the whole tag. Used to decide
// when the value input should offer the enumerated indicator list.
export const isMarcIndicatorTarget = (name) => {
  const target = parseMarcFieldName(name)?.target;

  return target === MARC_TARGETS.IND1 || target === MARC_TARGETS.IND2;
};

// Human-readable column/header label for a MARC field name, e.g. "MARC 245 ind1=0", "MARC 245$a",
// "MARC 245 ind1=1 $a", "MARC 245 ind1" — mirrors the backend's MarcFieldName label. Returns the raw name if it
// isn't a MARC field.
export const getMarcColumnLabel = (name) => {
  const parsed = parseMarcFieldName(name);

  if (!parsed) return name;

  const { tag, target, subfield, ind1, ind2 } = parsed;
  const hasConstraint = ind1 !== null || ind2 !== null;
  let label = `MARC ${tag}`;

  if (ind1 !== null) label += ` ind1=${ind1}`;
  if (ind2 !== null) label += ` ind2=${ind2}`;

  if (target === MARC_TARGETS.IND1 || target === MARC_TARGETS.IND2) {
    label += ` ind${target === MARC_TARGETS.IND1 ? '1' : '2'}`;
  } else if (subfield !== null) {
    // Attached ("MARC 245$a") when unconstrained; spaced ("... $a") when following an indicator constraint.
    label += hasConstraint ? ` $${subfield}` : `$${subfield}`;
  }

  return label;
};

// Normalize an indicator input to its stored value: null when nothing was entered (no constraint on that
// indicator), otherwise the lowercased value. Note a literal 'blank' is a real value here, not an empty input.
const normalizeIndicatorValue = (value) => (
  value === '' || value === null || value === undefined ? null : String(value).toLowerCase()
);

const indicatorConstraint = (position, value) => (value === null ? '' : `_ind${position}_${value}`);

// Builds the part of the field name after `marc_<tag>` for each target, or null if the state is invalid for that
// target. Kept as a lookup so assembleMarcFieldName stays flat.
const SUFFIX_BUILDERS = {
  // Whole tag (marc_245), optionally narrowed by indicator constraint(s) (marc_245_ind1_0), no subfield.
  [MARC_TARGETS.TAG]: ({ c1, c2 }) => `${indicatorConstraint(1, c1)}${indicatorConstraint(2, c2)}`,
  [MARC_TARGETS.SUBFIELD]: ({ subfield, c1, c2 }) => {
    if (!/^[a-z0-9]$/i.test(subfield ?? '')) return null;

    return `${indicatorConstraint(1, c1)}${indicatorConstraint(2, c2)}_${String(subfield).toLowerCase()}`;
  },
  [MARC_TARGETS.IND1]: ({ c2 }) => (c2 === null ? '_ind1' : `_ind2_${c2}_ind1`),
  [MARC_TARGETS.IND2]: ({ c1 }) => (c1 === null ? '_ind2' : `_ind1_${c1}_ind2`),
};

/**
 * Assemble a canonical MARC field name from picker state, or null if the state isn't complete enough to be valid.
 */
export function assembleMarcFieldName({ sourcePrefix = '', tag, target, subfield, ind1, ind2 } = {}) {
  if (!/^\d{3}$/.test(tag ?? '')) return null;

  // Control fields (00X) are only valid as the bare tag. Ignore any (possibly stale) subfield/indicator state —
  // mirrors the parser's control-field rule so we never emit an invalid name like marc_008_ind1_0.
  if (isControlFieldTag(tag)) {
    return `${sourcePrefix}marc_${tag}`;
  }

  const builder = SUFFIX_BUILDERS[target];

  if (!builder) return null;

  const suffix = builder({ subfield, c1: normalizeIndicatorValue(ind1), c2: normalizeIndicatorValue(ind2) });

  return suffix === null ? null : `${sourcePrefix}marc_${tag}${suffix}`;
}
