import { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TextField } from '@folio/stripes/components';

import {
  assembleMarcFieldName,
  parseMarcFieldName,
  isControlFieldTag,
  MARC_TARGETS,
  MARC_BLANK_INDICATOR,
} from '../../helpers/marcFields';
import css from './MarcFieldControl.css';

// A tag is exactly 3 digits; a subfield and an indicator are each exactly 1 character. Used for the input
// maxLength and to gate validation (see tagInvalid/subfieldInvalid/indicatorInvalid below).
const TAG_LENGTH = 3;
const SUBFIELD_LENGTH = 1;
const INDICATOR_LENGTH = 1;

const BLANK_DISPLAY = '\\';
const toIndicatorDisplay = (token) => (token === MARC_BLANK_INDICATOR ? BLANK_DISPLAY : token ?? '');
const toIndicatorToken = (display) => (display === BLANK_DISPLAY ? MARC_BLANK_INDICATOR : display);

const toDraft = (fieldName) => {
  const parsed = parseMarcFieldName(fieldName);

  return {
    tag: parsed?.tag ?? '',
    subfield: parsed?.subfield ?? '',
    ind1: toIndicatorDisplay(parsed?.ind1),
    ind2: toIndicatorDisplay(parsed?.ind2),
  };
};

// Field-cell control for a MARC condition (simplified model): a flat set of boxes — tag plus, for data fields, an
// optional subfield and optional indicator constraints. The subfield is always the query target (its value goes in
// the row's value box); with no subfield, the whole tag is the target (covers control fields and tag-level queries).
export const MarcFieldControl = ({ sourcePrefix, value, onFieldChange, index }) => {
  const [draft, setDraft] = useState(() => toDraft(value));
  // Whether the user has left the tag box since they last started editing it. A wrong-length tag is flagged
  // only once they leave (blur); focusing back in clears this, so re-editing a tag never nags mid-change.
  const [tagTouched, setTagTouched] = useState(false);

  const update = (patch) => {
    const next = { ...draft, ...patch };

    // Subfield is the target when present; otherwise the whole tag. Control fields (00X) have no subfields or
    // indicators, so they only ever build the whole-tag form.
    const target = !isControlFieldTag(next.tag) && next.subfield ? MARC_TARGETS.SUBFIELD : MARC_TARGETS.TAG;

    setDraft(next);
    onFieldChange(
      assembleMarcFieldName({
        sourcePrefix,
        tag: next.tag,
        target,
        subfield: next.subfield,
        ind1: toIndicatorToken(next.ind1),
        ind2: toIndicatorToken(next.ind2),
      }) ?? '',
    );
  };

  // Control fields (00X) have no subfields or indicators — only the tag box applies.
  const showSubfieldAndIndicators = !isControlFieldTag(draft.tag);

  // Flag the tag once it's full-length-but-wrong (e.g. "24a"), or once the user leaves the box holding the
  // wrong length (e.g. "24") — but never mid-entry while they're still typing toward a valid 3-digit tag.
  // A subfield/indicator is a single character, so any entry is already complete: flag an invalid one immediately.
  // A valid indicator is a-z, 0-9, or the backslash that stands in for a blank; empty means no constraint.
  const tagInvalid = draft.tag !== '' && !/^\d{3}$/.test(draft.tag) && (draft.tag.length === TAG_LENGTH || tagTouched);
  const subfieldInvalid = draft.subfield.length === SUBFIELD_LENGTH && !/^[a-z0-9]$/i.test(draft.subfield);
  const indicatorInvalid = (indicator) => indicator.length === INDICATOR_LENGTH && !/^[\\a-z0-9]$/i.test(indicator);

  return (
    <div className={css.marcFieldControl} data-testid={`marc-field-${index}`}>
      <div className={css.tagInput}>
        <TextField
          label={<FormattedMessage id="ui-plugin-query-builder.marc.tag" />}
          value={draft.tag}
          onChange={(e) => update({ tag: e.target.value.trim() })}
          onFocus={() => setTagTouched(false)}
          onBlur={() => setTagTouched(true)}
          error={tagInvalid && <FormattedMessage id="ui-plugin-query-builder.marc.validation.tag" />}
          maxLength={TAG_LENGTH}
          required
          marginBottom0
          hasClearIcon={false}
          data-testid={`marc-tag-${index}`}
        />
      </div>

      {showSubfieldAndIndicators && (
        <>
          <div className={css.indicatorInput}>
            <TextField
              label={<FormattedMessage id="ui-plugin-query-builder.marc.ind1Filter" />}
              value={draft.ind1}
              onChange={(e) => update({ ind1: e.target.value })}
              onFocus={(e) => e.target.select()}
              error={indicatorInvalid(draft.ind1) && <FormattedMessage id="ui-plugin-query-builder.marc.validation.indicator" />}
              maxLength={INDICATOR_LENGTH}
              marginBottom0
              hasClearIcon={false}
              data-testid={`marc-ind1-${index}`}
            />
          </div>
          <div className={css.indicatorInput}>
            <TextField
              label={<FormattedMessage id="ui-plugin-query-builder.marc.ind2Filter" />}
              value={draft.ind2}
              onChange={(e) => update({ ind2: e.target.value })}
              onFocus={(e) => e.target.select()}
              error={indicatorInvalid(draft.ind2) && <FormattedMessage id="ui-plugin-query-builder.marc.validation.indicator" />}
              maxLength={INDICATOR_LENGTH}
              marginBottom0
              hasClearIcon={false}
              data-testid={`marc-ind2-${index}`}
            />
          </div>
          <div className={css.subfieldInput}>
            <TextField
              label={<FormattedMessage id="ui-plugin-query-builder.marc.subfield" />}
              value={draft.subfield}
              onChange={(e) => update({ subfield: e.target.value.trim() })}
              error={subfieldInvalid && <FormattedMessage id="ui-plugin-query-builder.marc.validation.subfield" />}
              maxLength={SUBFIELD_LENGTH}
              marginBottom0
              hasClearIcon={false}
              data-testid={`marc-subfield-${index}`}
            />
          </div>
        </>
      )}
    </div>
  );
};

MarcFieldControl.propTypes = {
  sourcePrefix: PropTypes.string,
  value: PropTypes.string,
  onFieldChange: PropTypes.func.isRequired,
  index: PropTypes.number,
};

MarcFieldControl.defaultProps = {
  sourcePrefix: '',
  value: '',
};
