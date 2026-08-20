import { render, fireEvent, cleanup } from '@testing-library/react';
import Intl from '../../../../../test/jest/__mock__/intlProvider.mock';
import { MarcFieldControl } from './MarcFieldControl';

const setup = (props = {}) => {
  const onFieldChange = jest.fn();
  const utils = render(
    <Intl>
      <MarcFieldControl index={0} onFieldChange={onFieldChange} {...props} />
    </Intl>,
  );

  return { onFieldChange, ...utils };
};

const change = (el, value) => fireEvent.change(el, { target: { value } });

afterEach(cleanup);

describe('MarcFieldControl (subfield-target model)', () => {
  it('shows the tag, subfield, and both indicator constraints', () => {
    const { getByTestId, queryByTestId } = setup();

    change(getByTestId('marc-tag-0'), '245');

    expect(getByTestId('marc-tag-0')).toBeInTheDocument();
    expect(getByTestId('marc-subfield-0')).toBeInTheDocument();
    expect(getByTestId('marc-ind1-0')).toBeInTheDocument();
    expect(getByTestId('marc-ind2-0')).toBeInTheDocument();
    expect(queryByTestId('marc-target-0')).not.toBeInTheDocument();
  });

  it('assembles a subfield field name with indicator constraints', () => {
    const { getByTestId, onFieldChange } = setup();

    change(getByTestId('marc-tag-0'), '245');
    change(getByTestId('marc-subfield-0'), 'a');
    expect(onFieldChange).toHaveBeenLastCalledWith('marc_245_a');

    change(getByTestId('marc-ind1-0'), '1');
    change(getByTestId('marc-ind2-0'), '2');
    expect(onFieldChange).toHaveBeenLastCalledWith('marc_245_ind1_1_ind2_2_a');
  });

  it('targets the whole tag when no subfield is entered', () => {
    const { getByTestId, onFieldChange } = setup();

    change(getByTestId('marc-tag-0'), '245');

    expect(onFieldChange).toHaveBeenLastCalledWith('marc_245');
  });

  it('builds a whole-field indicator constraint when an indicator is set without a subfield', () => {
    const { getByTestId, onFieldChange } = setup();

    change(getByTestId('marc-tag-0'), '245');
    change(getByTestId('marc-ind1-0'), '0');

    expect(onFieldChange).toHaveBeenLastCalledWith('marc_245_ind1_0');
  });

  it('pins an indicator constraint typed as text, treating a backslash as blank', () => {
    const { getByTestId, onFieldChange } = setup();

    change(getByTestId('marc-tag-0'), '245');
    change(getByTestId('marc-subfield-0'), 'a');
    change(getByTestId('marc-ind1-0'), '\\');

    expect(onFieldChange).toHaveBeenLastCalledWith('marc_245_ind1_blank_a');
  });

  it('treats an empty indicator box as no constraint', () => {
    const { getByTestId, onFieldChange } = setup({ value: 'marc_245_ind1_1_a' });

    expect(getByTestId('marc-ind1-0').value).toBe('1');
    change(getByTestId('marc-ind1-0'), '');

    expect(onFieldChange).toHaveBeenLastCalledWith('marc_245_a');
  });

  it('prepends the composite source prefix', () => {
    const { getByTestId, onFieldChange } = setup({ sourcePrefix: 'marc_bib.' });

    change(getByTestId('marc-tag-0'), '245');
    change(getByTestId('marc-subfield-0'), 'a');

    expect(onFieldChange).toHaveBeenLastCalledWith('marc_bib.marc_245_a');
  });

  it('restricts control-field tags (00X) to the whole tag (no subfield/indicators)', () => {
    const { getByTestId, queryByTestId, onFieldChange } = setup();

    change(getByTestId('marc-tag-0'), '008');

    expect(queryByTestId('marc-subfield-0')).not.toBeInTheDocument();
    expect(queryByTestId('marc-ind1-0')).not.toBeInTheDocument();
    expect(queryByTestId('marc-ind2-0')).not.toBeInTheDocument();
    expect(onFieldChange).toHaveBeenLastCalledWith('marc_008');
  });

  it('round-trips a saved subfield field name into its inputs', () => {
    const { getByTestId } = setup({ value: 'marc_245_ind1_1_ind2_2_a' });

    expect(getByTestId('marc-tag-0').value).toBe('245');
    expect(getByTestId('marc-subfield-0').value).toBe('a');
    expect(getByTestId('marc-ind1-0').value).toBe('1');
    expect(getByTestId('marc-ind2-0').value).toBe('2');
  });

  it('round-trips a saved blank-indicator constraint back to a backslash', () => {
    const { getByTestId } = setup({ value: 'marc_245_ind1_blank_a' });

    expect(getByTestId('marc-ind1-0').value).toBe('\\');
    expect(getByTestId('marc-ind2-0').value).toBe('');
  });

  it('does not flag a partially-typed tag while still in the box', () => {
    const { getByTestId } = setup();

    change(getByTestId('marc-tag-0'), '24'); // still mid-entry, hasn't left the box

    expect(getByTestId('marc-tag-0')).toHaveAttribute('aria-invalid', 'false');
  });

  it('flags a wrong-length tag once the user clicks out of the box', () => {
    const { getByTestId } = setup();
    const tag = getByTestId('marc-tag-0');

    change(tag, '24');
    expect(tag).toHaveAttribute('aria-invalid', 'false'); // not yet — still focused

    fireEvent.blur(tag);
    expect(tag).toHaveAttribute('aria-invalid', 'true'); // left it at 2 digits
  });

  it('does not re-flag mid-edit when a previously-valid tag is shortened (only on the next blur)', () => {
    const { getByTestId } = setup();
    const tag = getByTestId('marc-tag-0');

    // Enter a valid tag and leave the box.
    change(tag, '245');
    fireEvent.blur(tag);
    expect(tag).toHaveAttribute('aria-invalid', 'false');

    // Focus back in and shorten it — must NOT flag while still editing.
    fireEvent.focus(tag);
    change(tag, '24');
    expect(tag).toHaveAttribute('aria-invalid', 'false');

    // Only flags again once the user leaves the box.
    fireEvent.blur(tag);
    expect(tag).toHaveAttribute('aria-invalid', 'true');
  });

  it('flags a full-length invalid tag, and clears it once valid', () => {
    const { getByTestId } = setup();
    const tag = getByTestId('marc-tag-0');

    change(tag, '24a'); // 3 chars but not all digits
    expect(tag).toHaveAttribute('aria-invalid', 'true');

    change(tag, '245'); // corrected — error clears live
    expect(tag).toHaveAttribute('aria-invalid', 'false');
  });

  it('does not flag an empty tag', () => {
    const { getByTestId } = setup();
    const tag = getByTestId('marc-tag-0');

    change(tag, '2');
    change(tag, ''); // cleared back to empty

    expect(tag).toHaveAttribute('aria-invalid', 'false');
  });

  it('flags an invalid subfield, and clears it once valid', () => {
    const { getByTestId } = setup();

    change(getByTestId('marc-tag-0'), '245');
    const subfield = getByTestId('marc-subfield-0');

    change(subfield, '!');
    expect(subfield).toHaveAttribute('aria-invalid', 'true');

    change(subfield, 'a');
    expect(subfield).toHaveAttribute('aria-invalid', 'false');
  });

  it('flags an invalid indicator in either box, and clears it once valid', () => {
    const { getByTestId } = setup();

    change(getByTestId('marc-tag-0'), '245');
    const ind1 = getByTestId('marc-ind1-0');
    const ind2 = getByTestId('marc-ind2-0');

    change(ind1, '!');
    expect(ind1).toHaveAttribute('aria-invalid', 'true');

    change(ind1, '0');
    expect(ind1).toHaveAttribute('aria-invalid', 'false');

    // Second indicator is validated independently.
    change(ind2, '#');
    expect(ind2).toHaveAttribute('aria-invalid', 'true');
  });

  it('accepts a backslash (blank) as a valid indicator', () => {
    const { getByTestId } = setup();

    change(getByTestId('marc-tag-0'), '245');
    const ind1 = getByTestId('marc-ind1-0');

    change(ind1, '\\');
    expect(ind1).toHaveAttribute('aria-invalid', 'false');
  });

  it('selects the box contents on focus so typing overwrites the single character', () => {
    const { getByTestId } = setup({ value: 'marc_245_ind1_1_ind2_2_a' });

    ['marc-ind1-0', 'marc-ind2-0'].forEach((testId) => {
      const indicator = getByTestId(testId);

      fireEvent.focus(indicator);

      expect(indicator.selectionStart).toBe(0);
      expect(indicator.selectionEnd).toBe(indicator.value.length);
    });
  });
});
