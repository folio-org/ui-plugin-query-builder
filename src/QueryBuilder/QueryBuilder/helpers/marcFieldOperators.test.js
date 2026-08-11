import {
  isMarcIndicatorTarget,
  getMarcOperators,
  isMarcOperatorValid,
} from './marcFieldOperators';
import { OPERATORS, getDiscreteOrTextOperators } from '../../../constants/operators';

describe('marcFieldOperators', () => {
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

  describe('isMarcOperatorValid', () => {
    it('is true for an operator that belongs to the current shape', () => {
      expect(isMarcOperatorValid(OPERATORS.IN, { indicator1: { isTarget: true, value: null } })).toBe(true);
    });

    it('is false once the shape changes underneath the operator (indicator target -> subfield added)', () => {
      const marcSelector = { subfield: 'a' };

      expect(isMarcOperatorValid(OPERATORS.IN, marcSelector)).toBe(false);
    });

    it('is true when the operator is shared by both operator sets (e.g. `==`)', () => {
      expect(isMarcOperatorValid(OPERATORS.EQUAL, {})).toBe(true);
      expect(isMarcOperatorValid(OPERATORS.EQUAL, { indicator1: { isTarget: true, value: null } })).toBe(true);
    });

    it('is false for empty on an indicator target, since an indicator always has a value', () => {
      expect(isMarcOperatorValid(OPERATORS.EMPTY, { indicator1: { isTarget: true, value: null } })).toBe(false);
    });

    it('is true for empty on a non-indicator-target selector', () => {
      expect(isMarcOperatorValid(OPERATORS.EMPTY, { subfield: 'a' })).toBe(true);
    });
  });
});
