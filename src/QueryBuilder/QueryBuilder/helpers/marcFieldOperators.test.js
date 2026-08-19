import { getMarcOperators } from './marcFieldOperators';
import { OPERATORS, getDiscreteOrTextOperators } from '../../../constants/operators';

describe('marcFieldOperators', () => {
  describe('getMarcOperators', () => {
    it('returns the free-text operator set for a subfield/whole-tag target', () => {
      expect(getMarcOperators('marc_245_a')).toEqual(getDiscreteOrTextOperators(false));
      expect(getMarcOperators('marc_245')).toEqual(getDiscreteOrTextOperators(false));
      // A whole-field indicator constraint targets the tag value, so it gets the full free-text operator set too.
      expect(getMarcOperators('marc_245_ind1_0')).toEqual(getDiscreteOrTextOperators(false));
      expect(getMarcOperators('marc_245_ind1_1_ind2_2')).toEqual(getDiscreteOrTextOperators(false));
    });

    it('returns no operators for an incomplete or non-MARC field name', () => {
      // The MARC control emits '' while the tag is incomplete/invalid; no operators keeps the operator and
      // value cells collapsed until a complete field name is built.
      expect(getMarcOperators('')).toEqual([]);
      expect(getMarcOperators('marc_24')).toEqual([]);
      expect(getMarcOperators('title')).toEqual([]);
    });

    it('returns discrete operators without empty for an indicator target', () => {
      expect(getMarcOperators('marc_245_ind1')).toEqual([
        OPERATORS.EQUAL,
        OPERATORS.NOT_EQUAL,
        OPERATORS.IN,
        OPERATORS.NOT_IN,
      ]);
    });

    it('treats a constrained-indicator target the same way (either slot)', () => {
      expect(getMarcOperators('marc_245_ind1_1_ind2')).toEqual([
        OPERATORS.EQUAL,
        OPERATORS.NOT_EQUAL,
        OPERATORS.IN,
        OPERATORS.NOT_IN,
      ]);
    });
  });
});
