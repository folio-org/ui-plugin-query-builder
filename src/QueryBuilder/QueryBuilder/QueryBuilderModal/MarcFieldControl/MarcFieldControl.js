import { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Select, TextField } from '@folio/stripes/components';

import { assembleMarcFieldName, parseMarcFieldName, isControlFieldTag, MARC_TARGETS } from '../../helpers/marcFields';
import { getMarcIndicatorValueOptions } from '../../helpers/selectOptions';
import css from './MarcFieldControl.css';

// A tag is exactly 3 digits; a subfield is exactly 1 character. Used for the input maxLength and to gate
// validation (see tagInvalid/subfieldInvalid below).
const TAG_LENGTH = 3;
const SUBFIELD_LENGTH = 1;

const toDraft = (fieldName) => {
  const parsed = parseMarcFieldName(fieldName);

  return {
    tag: parsed?.tag ?? '',
    subfield: parsed?.subfield ?? '',
    ind1: parsed?.ind1 ?? '',
    ind2: parsed?.ind2 ?? '',
  };
};

// Field-cell control for a MARC condition (simplified model): a flat set of boxes — tag plus, for data fields, an
// optional subfield and optional indicator constraints. The subfield is always the query target (its value goes in
// the row's value box); with no subfield, the whole tag is the target (covers control fields and tag-level queries).
export const MarcFieldControl = ({ sourcePrefix, value, onFieldChange, index }) => {
  const intl = useIntl();
  const [draft, setDraft] = useState(() => toDraft(value));
  // Tracks whether the user has left the tag box, so we can flag a wrong-length tag on blur without nagging
  // while they're still typing toward a valid 3-digit tag.
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
        ind1: next.ind1,
        ind2: next.ind2,
      }) ?? '',
    );
  };

  // A pinned indicator holds exactly one value; "Any" (value '') means no constraint on that indicator.
  const indicatorConstraintOptions = [
    { value: '', label: intl.formatMessage({ id: 'ui-plugin-query-builder.marc.indicator.any' }) },
    ...getMarcIndicatorValueOptions(intl),
  ];

  // Control fields (00X) have no subfields or indicators — only the tag box applies.
  const showSubfieldAndIndicators = !isControlFieldTag(draft.tag);

  // Flag the tag once it's full-length-but-wrong (e.g. "24a"), or once the user leaves the box holding the
  // wrong length (e.g. "24") — but never mid-entry while they're still typing toward a valid 3-digit tag.
  // A subfield is a single character, so any entry is already complete: flag an invalid one immediately.
  const tagInvalid = draft.tag !== '' && !/^\d{3}$/.test(draft.tag) && (draft.tag.length === TAG_LENGTH || tagTouched);
  const subfieldInvalid = draft.subfield.length === SUBFIELD_LENGTH && !/^[a-z0-9]$/i.test(draft.subfield);

  return (
    <div className={css.marcFieldControl} data-testid={`marc-field-${index}`}>
      <div className={css.tagInput}>
        <TextField
          label={<FormattedMessage id="ui-plugin-query-builder.marc.tag" />}
          value={draft.tag}
          onChange={(e) => update({ tag: e.target.value.trim() })}
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
            <Select
              label={<FormattedMessage id="ui-plugin-query-builder.marc.ind1Filter" />}
              dataOptions={indicatorConstraintOptions}
              value={draft.ind1}
              onChange={(e) => update({ ind1: e.target.value })}
              marginBottom0
              data-testid={`marc-ind1-${index}`}
            />
          </div>
          <div className={css.indicatorInput}>
            <Select
              label={<FormattedMessage id="ui-plugin-query-builder.marc.ind2Filter" />}
              dataOptions={indicatorConstraintOptions}
              value={draft.ind2}
              onChange={(e) => update({ ind2: e.target.value })}
              marginBottom0
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
