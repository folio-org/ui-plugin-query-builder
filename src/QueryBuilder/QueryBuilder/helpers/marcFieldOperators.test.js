import {
  parseMarcSelector,
  isMarcIndicatorTarget,
  getMarcOperators,
} from './marcFieldOperators';
import { OPERATORS, getDiscreteOrTextOperators } from '../../../constants/operators';

describe('marcFieldOperators', () => {
  describe('parseMarcSelector', () => {
    it('returns null for a non-string field name', () => {
      expect(parseMarcSelector(undefined)).toBeNull();
    });

    it('returns null for a non-MARC field name', () => {
      expect(parseMarcSelector('title')).toBeNull();
    });

    it('parses a tag-only field name (marc_245)', () => {
      expect(parseMarcSelector('marc_245')).toEqual({
        subfield: null,
        indicator1: null,
        indicator2: null,
      });
    });

    it('parses a control field tag as tag-only (marc_008)', () => {
      expect(parseMarcSelector('marc_008')).toEqual({
        subfield: null,
        indicator1: null,
        indicator2: null,
      });
    });

    it('parses a subfield field name (marc_245_a)', () => {
      expect(parseMarcSelector('marc_245_a')).toEqual({
        subfield: 'a',
        indicator1: null,
        indicator2: null,
      });
    });

    it('parses an indicator-target field name (marc_245_ind1)', () => {
      expect(parseMarcSelector('marc_245_ind1')).toEqual({
        subfield: null,
        indicator1: { isTarget: true, value: null },
        indicator2: null,
      });
    });

    it('parses the other indicator-target field name (marc_245_ind2)', () => {
      expect(parseMarcSelector('marc_245_ind2')).toEqual({
        subfield: null,
        indicator1: null,
        indicator2: { isTarget: true, value: null },
      });
    });

    it('parses a constrained subfield with one indicator fixed (marc_245_ind1_7_a)', () => {
      expect(parseMarcSelector('marc_245_ind1_7_a')).toEqual({
        subfield: 'a',
        indicator1: { isTarget: false, value: '7' },
        indicator2: null,
      });
    });

    it('parses a constrained subfield with a blank indicator (marc_245_ind1_blank_a)', () => {
      expect(parseMarcSelector('marc_245_ind1_blank_a')).toEqual({
        subfield: 'a',
        indicator1: { isTarget: false, value: 'blank' },
        indicator2: null,
      });
    });

    it('parses a dual-indicator constrained subfield (marc_245_ind1_1_ind2_2_a)', () => {
      expect(parseMarcSelector('marc_245_ind1_1_ind2_2_a')).toEqual({
        subfield: 'a',
        indicator1: { isTarget: false, value: '1' },
        indicator2: { isTarget: false, value: '2' },
      });
    });

    it('parses a constrained indicator target (marc_245_ind1_1_ind2)', () => {
      expect(parseMarcSelector('marc_245_ind1_1_ind2')).toEqual({
        subfield: null,
        indicator1: { isTarget: false, value: '1' },
        indicator2: { isTarget: true, value: null },
      });
    });

    it('parses a constrained indicator target with the constraint on ind2 (marc_245_ind2_1_ind1)', () => {
      expect(parseMarcSelector('marc_245_ind2_1_ind1')).toEqual({
        subfield: null,
        indicator1: { isTarget: true, value: null },
        indicator2: { isTarget: false, value: '1' },
      });
    });

    it('strips a composite source-alias prefix before parsing (marc_bib.marc_245_ind1)', () => {
      expect(parseMarcSelector('marc_bib.marc_245_ind1')).toEqual({
        subfield: null,
        indicator1: { isTarget: true, value: null },
        indicator2: null,
      });
    });

    it('is case-insensitive (MARC_245_IND1)', () => {
      expect(parseMarcSelector('MARC_245_IND1')).toEqual({
        subfield: null,
        indicator1: { isTarget: true, value: null },
        indicator2: null,
      });
    });

    it('returns null for a subfield on a control field tag (marc_008_a)', () => {
      expect(parseMarcSelector('marc_008_a')).toBeNull();
    });

    it('returns null when both indicators on a constrained-indicator-target are the same slot (marc_245_ind1_1_ind1)', () => {
      expect(parseMarcSelector('marc_245_ind1_1_ind1')).toBeNull();
    });
  });

  describe('isMarcIndicatorTarget', () => {
    it('returns false for a tag-only selector (marc_245)', () => {
      expect(isMarcIndicatorTarget({})).toBe(false);
    });

    it('returns false for a subfield-only selector (marc_245_a)', () => {
      expect(isMarcIndicatorTarget({ subfield: 'a' })).toBe(false);
    });

    it('returns true for an indicator-only selector (marc_245_ind1)', () => {
      expect(isMarcIndicatorTarget({
        indicator1: { isTarget: true, value: null },
      })).toBe(true);
    });

    it('returns false for a constrained subfield with one indicator fixed (marc_245_ind1_7_a)', () => {
      expect(isMarcIndicatorTarget({
        indicator1: { isTarget: false, value: '7' },
        subfield: 'a',
      })).toBe(false);
    });

    it('returns false for a dual-indicator subfield with both fixed (marc_245_ind1_1_ind2_2_a)', () => {
      expect(isMarcIndicatorTarget({
        indicator1: { isTarget: false, value: '1' },
        indicator2: { isTarget: false, value: '2' },
        subfield: 'a',
      })).toBe(false);
    });

    it('returns true for a constrained indicator target with the other indicator fixed (marc_245_ind1_1_ind2)', () => {
      expect(isMarcIndicatorTarget({
        indicator1: { isTarget: false, value: '1' },
        indicator2: { isTarget: true, value: null },
      })).toBe(true);
    });

    it('is unaffected by a blank indicator value (marc_245_ind1_blank_a)', () => {
      expect(isMarcIndicatorTarget({
        indicator1: { isTarget: false, value: 'blank' },
        subfield: 'a',
      })).toBe(false);
    });

    it('is unaffected by a blank indicator value when the indicator is the target', () => {
      expect(isMarcIndicatorTarget({
        indicator1: { isTarget: true, value: 'blank' },
      })).toBe(true);
    });

    it('subfield takes priority even if an indicator is also a target', () => {
      expect(isMarcIndicatorTarget({
        indicator1: { isTarget: true, value: null },
        subfield: 'a',
      })).toBe(false);
    });
  });

  describe('getMarcOperators', () => {
    it('returns text operators for non-indicator-target selectors', () => {
      expect(getMarcOperators({ subfield: 'a' })).toEqual(getDiscreteOrTextOperators(false));
    });

    it('returns discrete operators without empty for indicator-target selectors', () => {
      expect(getMarcOperators({ indicator1: { isTarget: true, value: null } })).toEqual([
        OPERATORS.EQUAL,
        OPERATORS.NOT_EQUAL,
        OPERATORS.IN,
        OPERATORS.NOT_IN,
      ]);
    });
  });
});
