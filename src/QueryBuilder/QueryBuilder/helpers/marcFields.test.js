import {
  assembleMarcFieldName,
  parseMarcFieldName,
  isMarcFieldName,
  isMarcIndicatorTarget,
  getMarcColumnLabel,
  isControlFieldTag,
  findMarcPlaceholder,
  getMarcSourcePrefix,
  MARC_TARGETS,
} from './marcFields';

describe('marcFields helpers', () => {
  describe('parseMarcFieldName', () => {
    it('parses a tag-only field', () => {
      expect(parseMarcFieldName('marc_245')).toEqual({
        sourcePrefix: '', tag: '245', target: MARC_TARGETS.TAG, subfield: null, ind1: null, ind2: null,
      });
    });

    it('parses a subfield field', () => {
      expect(parseMarcFieldName('marc_245_a')).toEqual({
        sourcePrefix: '', tag: '245', target: MARC_TARGETS.SUBFIELD, subfield: 'a', ind1: null, ind2: null,
      });
    });

    it('parses an indicator-only (target) field', () => {
      expect(parseMarcFieldName('marc_245_ind1')).toMatchObject({ target: MARC_TARGETS.IND1, ind1: null, ind2: null });
      expect(parseMarcFieldName('marc_245_ind2')).toMatchObject({ target: MARC_TARGETS.IND2, ind1: null, ind2: null });
    });

    it('parses a one-indicator constrained subfield', () => {
      expect(parseMarcFieldName('marc_245_ind1_7_a')).toMatchObject({
        target: MARC_TARGETS.SUBFIELD, subfield: 'a', ind1: '7', ind2: null,
      });
      expect(parseMarcFieldName('marc_245_ind2_blank_a')).toMatchObject({
        target: MARC_TARGETS.SUBFIELD, subfield: 'a', ind1: null, ind2: 'blank',
      });
    });

    it('parses a dual-indicator constrained subfield', () => {
      expect(parseMarcFieldName('marc_245_ind1_1_ind2_2_a')).toMatchObject({
        target: MARC_TARGETS.SUBFIELD, subfield: 'a', ind1: '1', ind2: '2',
      });
    });

    it('parses a constrained indicator target (both orderings)', () => {
      expect(parseMarcFieldName('marc_245_ind1_1_ind2')).toMatchObject({ target: MARC_TARGETS.IND2, ind1: '1', ind2: null });
      expect(parseMarcFieldName('marc_245_ind2_0_ind1')).toMatchObject({ target: MARC_TARGETS.IND1, ind1: null, ind2: '0' });
    });

    it('parses a whole-field indicator constraint with no subfield (target is the tag)', () => {
      expect(parseMarcFieldName('marc_245_ind1_0')).toEqual({
        sourcePrefix: '', tag: '245', target: MARC_TARGETS.TAG, subfield: null, ind1: '0', ind2: null,
      });
      expect(parseMarcFieldName('marc_245_ind2_1')).toMatchObject({ target: MARC_TARGETS.TAG, ind1: null, ind2: '1' });
      expect(parseMarcFieldName('marc_245_ind1_blank')).toMatchObject({ target: MARC_TARGETS.TAG, ind1: 'blank', ind2: null });
      expect(parseMarcFieldName('marc_245_ind1_1_ind2_2')).toMatchObject({ target: MARC_TARGETS.TAG, ind1: '1', ind2: '2' });
    });

    it('captures a composite source prefix', () => {
      expect(parseMarcFieldName('marc_bib.marc_245_a')).toMatchObject({ sourcePrefix: 'marc_bib.', tag: '245', subfield: 'a' });
    });

    it.each([
      ['not a marc field', 'instance.title'],
      ['two-digit tag', 'marc_24'],
      ['same constrained + target indicator', 'marc_245_ind1_1_ind1'],
      ['control-field tag with a subfield', 'marc_008_a'],
      ['control-field tag with an indicator', 'marc_008_ind1'],
      ['control-field tag with an indicator constraint', 'marc_008_ind1_0'],
      ['control-field tag with dual indicator constraints', 'marc_008_ind1_1_ind2_2'],
      ['empty string', ''],
      ['null', null],
    ])('returns null for %s', (_desc, input) => {
      expect(parseMarcFieldName(input)).toBeNull();
    });
  });

  describe('assembleMarcFieldName', () => {
    it.each([
      ['tag only', { tag: '245', target: MARC_TARGETS.TAG }, 'marc_245'],
      ['subfield', { tag: '245', target: MARC_TARGETS.SUBFIELD, subfield: 'a' }, 'marc_245_a'],
      ['dual constrained subfield', { tag: '245', target: MARC_TARGETS.SUBFIELD, subfield: 'a', ind1: '1', ind2: '2' }, 'marc_245_ind1_1_ind2_2_a'],
      ['ind2-only constrained subfield', { tag: '245', target: MARC_TARGETS.SUBFIELD, subfield: 'a', ind2: '2' }, 'marc_245_ind2_2_a'],
      ['blank constraint', { tag: '245', target: MARC_TARGETS.SUBFIELD, subfield: 'a', ind1: 'blank' }, 'marc_245_ind1_blank_a'],
      ['indicator target, no constraint', { tag: '245', target: MARC_TARGETS.IND1 }, 'marc_245_ind1'],
      ['indicator target ind1 with ind2 constraint', { tag: '245', target: MARC_TARGETS.IND1, ind2: '0' }, 'marc_245_ind2_0_ind1'],
      ['indicator target ind2 with ind1 constraint', { tag: '245', target: MARC_TARGETS.IND2, ind1: '1' }, 'marc_245_ind1_1_ind2'],
      ['indicator target ind2, no constraint', { tag: '245', target: MARC_TARGETS.IND2 }, 'marc_245_ind2'],
      ['whole field, ind1 constraint', { tag: '245', target: MARC_TARGETS.TAG, ind1: '0' }, 'marc_245_ind1_0'],
      ['whole field, ind2 constraint', { tag: '245', target: MARC_TARGETS.TAG, ind2: '1' }, 'marc_245_ind2_1'],
      ['whole field, both indicators', { tag: '245', target: MARC_TARGETS.TAG, ind1: '1', ind2: '2' }, 'marc_245_ind1_1_ind2_2'],
      ['whole field, blank indicator', { tag: '245', target: MARC_TARGETS.TAG, ind1: 'blank' }, 'marc_245_ind1_blank'],
      // Control field: stale subfield/indicator state is ignored — only the bare tag is emitted.
      ['control tag ignores stale indicator', { tag: '008', target: MARC_TARGETS.TAG, ind1: '0' }, 'marc_008'],
      ['control tag ignores stale subfield', { tag: '008', target: MARC_TARGETS.SUBFIELD, subfield: 'a' }, 'marc_008'],
      ['composite prefix', { sourcePrefix: 'marc_bib.', tag: '245', target: MARC_TARGETS.SUBFIELD, subfield: 'a' }, 'marc_bib.marc_245_a'],
    ])('assembles %s', (_desc, parts, expected) => {
      expect(assembleMarcFieldName(parts)).toBe(expected);
    });

    it.each([
      ['bad tag', { tag: '24', target: MARC_TARGETS.SUBFIELD, subfield: 'a' }],
      ['subfield target without subfield', { tag: '245', target: MARC_TARGETS.SUBFIELD }],
      ['unknown target', { tag: '245', target: 'bogus' }],
      ['no tag', { target: MARC_TARGETS.TAG }],
      ['called with no arguments', undefined],
    ])('returns null for %s', (_desc, parts) => {
      expect(assembleMarcFieldName(parts)).toBeNull();
    });
  });

  describe('round-trips (parse -> assemble)', () => {
    it.each([
      'marc_245',
      'marc_245_a',
      'marc_245_ind1_7_a',
      'marc_245_ind1_1_ind2_2_a',
      'marc_245_ind1_blank_a',
      'marc_245_ind1',
      'marc_245_ind1_1_ind2',
      'marc_245_ind2_0_ind1',
      'marc_245_ind1_0',
      'marc_245_ind1_blank',
      'marc_245_ind1_1_ind2_2',
      'marc_bib.marc_245_ind1_1_ind2_2_a',
    ])('%s survives a parse/assemble round-trip', (name) => {
      expect(assembleMarcFieldName(parseMarcFieldName(name))).toBe(name);
    });
  });

  describe('isMarcFieldName', () => {
    it('is true for a marc field and false otherwise', () => {
      expect(isMarcFieldName('marc_245_a')).toBe(true);
      expect(isMarcFieldName('marc_bib.marc_245_ind1_1_ind2_2_a')).toBe(true);
      expect(isMarcFieldName('instance.title')).toBe(false);
    });
  });

  describe('isMarcIndicatorTarget', () => {
    it('is true when an indicator is the target (either slot), false for subfield/tag/non-marc', () => {
      expect(isMarcIndicatorTarget('marc_245_ind1')).toBe(true);
      expect(isMarcIndicatorTarget('marc_245_ind1_1_ind2')).toBe(true);
      expect(isMarcIndicatorTarget('marc_245_a')).toBe(false);
      expect(isMarcIndicatorTarget('marc_245')).toBe(false);
      // Whole-field indicator constraint: the tag is the target, not the indicator.
      expect(isMarcIndicatorTarget('marc_245_ind1_0')).toBe(false);
      expect(isMarcIndicatorTarget('marc_245_ind1_1_ind2_2')).toBe(false);
      expect(isMarcIndicatorTarget('instance.title')).toBe(false);
    });
  });

  describe('getMarcColumnLabel', () => {
    it.each([
      ['marc_245', 'MARC 245'],
      ['marc_245_a', 'MARC 245$a'],
      ['marc_245_ind1_0', 'MARC 245 ind1=0'],
      ['marc_245_ind1_1_a', 'MARC 245 ind1=1 $a'],
      ['marc_245_ind1_1_ind2_2', 'MARC 245 ind1=1 ind2=2'],
      ['marc_245_ind1', 'MARC 245 ind1'],
      ['marc_bib.marc_245_a', 'MARC 245$a'],
    ])('labels %s as "%s"', (name, label) => {
      expect(getMarcColumnLabel(name)).toBe(label);
    });

    it('returns the raw name for a non-MARC field', () => {
      expect(getMarcColumnLabel('instance.title')).toBe('instance.title');
    });
  });

  describe('isControlFieldTag', () => {
    it.each(['001', '005', '008', '009'])('%s is a control field', (tag) => {
      expect(isControlFieldTag(tag)).toBe(true);
    });

    it.each(['010', '100', '245', '999'])('%s is a data field', (tag) => {
      expect(isControlFieldTag(tag)).toBe(false);
    });
  });

  describe('detection', () => {
    const marcColumn = { name: 'marc', dataType: { dataType: 'marcType' } };
    const stringColumn = { name: 'title', dataType: { dataType: 'stringType' } };

    it('finds the marc placeholder column', () => {
      expect(findMarcPlaceholder([stringColumn, marcColumn])).toBe(marcColumn);
      expect(findMarcPlaceholder([stringColumn])).toBeNull();
    });

    it('derives the source prefix from the placeholder name', () => {
      expect(getMarcSourcePrefix('marc')).toBe('');
      expect(getMarcSourcePrefix('marc_bib.marc')).toBe('marc_bib.');
    });
  });
});
