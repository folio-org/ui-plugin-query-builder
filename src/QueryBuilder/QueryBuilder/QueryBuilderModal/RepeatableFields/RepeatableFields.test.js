import { useState } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Intl from '../../../../../test/jest/__mock__/intlProvider.mock';
import { RootContext } from '../../../../context/RootContext';
import {
  getMemoizedValues,
  applyMarcFieldChange,
  enterMarcFieldMode,
  RepeatableFields,
} from './RepeatableFields';
import { sourceTemplate, getFieldOptions } from '../../helpers/selectOptions';
import { COLUMN_KEYS } from '../../../../constants/columnKeys';
import { OPERATORS } from '../../../../constants/operators';
import { MARC_DATA_TYPE } from '../../helpers/marcFields';

jest.mock('../../../../hooks/useTenantTimezone', () => jest.fn(() => ({ tenantTimezone: 'UTC' })));

afterEach(cleanup);

const marcIntl = { formatMessage: ({ id }) => id };

const makeRow = (operatorCurrent = '') => ({
  [COLUMN_KEYS.FIELD]: { options: [], current: '', dataType: undefined },
  [COLUMN_KEYS.OPERATOR]: { options: [], current: operatorCurrent },
  [COLUMN_KEYS.VALUE]: { current: '' },
});

// Operator option values, minus the leading placeholder ('').
const operatorValues = (row) => row[COLUMN_KEYS.OPERATOR].options.map((option) => option.value).filter(Boolean);

describe('getMemoizedValues', () => {
  it('uses cached options when they exist', () => {
    const currentOptions = [{ value: 'available', label: 'Available' }];
    const getDataOptions = jest.fn();

    expect(getMemoizedValues({
      currentOptions,
      rowField: 'status',
      getDataOptions,
    })).toEqual(currentOptions);

    expect(getDataOptions).not.toHaveBeenCalled();
  });

  it('uses fetched options when cached options are missing', () => {
    const fetchedOptions = [{ value: 'available', label: 'Available' }];
    const getDataOptions = jest.fn(() => fetchedOptions);

    expect(getMemoizedValues({
      currentOptions: undefined,
      rowField: 'status',
      getDataOptions,
    })).toEqual(fetchedOptions);

    expect(getDataOptions).toHaveBeenCalledWith('status');
  });
});

describe('applyMarcFieldChange', () => {
  it('sets the MARC field and the subfield (free-text) operator set for a subfield field name', () => {
    const result = applyMarcFieldChange({ item: makeRow(), name: 'marc_245_a', intl: marcIntl });

    expect(result[COLUMN_KEYS.FIELD].current).toBe('marc_245_a');
    expect(result[COLUMN_KEYS.FIELD].isMarc).toBe(true);
    expect(result[COLUMN_KEYS.FIELD].dataType).toBe('stringType');
    expect(operatorValues(result)).toEqual([
      OPERATORS.EQUAL,
      OPERATORS.NOT_EQUAL,
      OPERATORS.CONTAINS,
      OPERATORS.STARTS_WITH,
      OPERATORS.EMPTY,
    ]);
  });

  it('uses the restricted indicator operator set for an indicator-target field name', () => {
    const result = applyMarcFieldChange({ item: makeRow(), name: 'marc_245_ind1', intl: marcIntl });

    expect(operatorValues(result)).toEqual([OPERATORS.EQUAL, OPERATORS.NOT_EQUAL, OPERATORS.IN, OPERATORS.NOT_IN]);
    expect(operatorValues(result)).not.toContain(OPERATORS.CONTAINS);
    expect(operatorValues(result)).not.toContain(OPERATORS.EMPTY);
  });

  it('clears an operator that is not valid for the new target type', () => {
    const result = applyMarcFieldChange({
      item: makeRow(OPERATORS.CONTAINS),
      name: 'marc_245_ind1',
      intl: marcIntl,
    });

    expect(result[COLUMN_KEYS.OPERATOR].current).toBe('');
  });

  it('keeps an operator that is still valid for the new target type', () => {
    const result = applyMarcFieldChange({
      item: makeRow(OPERATORS.EQUAL),
      name: 'marc_245_ind1',
      intl: marcIntl,
    });

    expect(result[COLUMN_KEYS.OPERATOR].current).toBe(OPERATORS.EQUAL);
  });

  it('leaves the MARC value free-text (no options)', () => {
    const result = applyMarcFieldChange({ item: makeRow(), name: 'marc_245_a', intl: marcIntl });

    expect(result[COLUMN_KEYS.VALUE].options).toBeUndefined();
  });

  it('clears the value when the field name changes', () => {
    const item = {
      ...makeRow(),
      [COLUMN_KEYS.FIELD]: { options: [], current: 'marc_245', dataType: 'stringType' },
      [COLUMN_KEYS.VALUE]: { current: 'Shakespeare' },
    };
    const result = applyMarcFieldChange({ item, name: 'marc_245_a', intl: marcIntl });

    expect(result[COLUMN_KEYS.VALUE].current).toBe('');
  });

  it('keeps the value when the field name is unchanged (no-op change)', () => {
    const item = {
      ...makeRow(),
      [COLUMN_KEYS.FIELD]: { options: [], current: 'marc_245_a', dataType: 'stringType' },
      [COLUMN_KEYS.VALUE]: { current: 'Shakespeare' },
    };
    const result = applyMarcFieldChange({ item, name: 'marc_245_a', intl: marcIntl });

    expect(result[COLUMN_KEYS.VALUE].current).toBe('Shakespeare');
  });
});

describe('enterMarcFieldMode', () => {
  it('blanks the field into MARC mode and clears the operator and value cells', () => {
    const item = {
      [COLUMN_KEYS.FIELD]: { options: ['x'], current: 'title', dataType: 'stringType' },
      [COLUMN_KEYS.OPERATOR]: { options: [{ value: OPERATORS.EQUAL }], current: OPERATORS.EQUAL },
      [COLUMN_KEYS.VALUE]: { options: ['v'], source: {}, valueSourceApi: {}, current: 'hello' },
    };

    const result = enterMarcFieldMode(item);

    // Field cell keeps its other props (options), blanks the name, and flips into MARC mode.
    expect(result[COLUMN_KEYS.FIELD]).toEqual({
      options: ['x'],
      current: '',
      isMarc: true,
      dataType: MARC_DATA_TYPE,
    });
    expect(result[COLUMN_KEYS.OPERATOR]).toEqual({ options: [], current: '' });
    expect(result[COLUMN_KEYS.VALUE]).toEqual({
      options: undefined,
      source: undefined,
      valueSourceApi: undefined,
      current: '',
    });
  });
});

// A MARC-capable entity type: a normal queryable column plus the hidden generic marcType placeholder.
const marcColumns = [
  { name: 'title', labelAlias: 'Title', dataType: { dataType: 'stringType' }, queryable: true, visibleByDefault: true },
  {
    name: 'marc',
    labelAlias: 'MARC',
    labelAliasFullyQualified: 'MARC bibliographic',
    dataType: { dataType: 'marcType' },
    queryable: false,
    hidden: true,
  },
];

// Holds source in state so setSource actually re-renders the rows, the way QueryBuilderModal drives it.
const Harness = () => {
  const [source, setSource] = useState([sourceTemplate(getFieldOptions(marcColumns))]);

  return <RepeatableFields source={source} setSource={setSource} columns={marcColumns} entityTypeId="et-1" />;
};

const renderRepeatableFields = () => render(
  <Intl>
    <RootContext.Provider value={{ getDataOptions: () => [], getDataOptionsWithFetching: () => [] }}>
      <Harness />
    </RootContext.Provider>
  </Intl>,
);

describe('RepeatableFields MARC wiring', () => {
  it('enters MARC mode from the field dropdown and applies MarcFieldControl edits to the row', async () => {
    renderRepeatableFields();

    // Pick the "MARC field" option -> handleChange's sentinel branch runs enterMarcFieldMode.
    await userEvent.click(await screen.findByText('ui-plugin-query-builder.control.selection.placeholder'));
    await userEvent.click(await screen.findByText('MARC bibliographic'));

    // MARC mode is on: the MarcFieldControl is now rendered.
    const tag = await screen.findByTestId('marc-tag-0');

    expect(tag).toBeInTheDocument();

    // Completing the field makes MarcFieldControl emit a name -> handleMarcFieldChange applies it to the row,
    // which surfaces the operator dropdown for that row.
    fireEvent.change(tag, { target: { value: '245' } });
    fireEvent.change(screen.getByTestId('marc-subfield-0'), { target: { value: 'a' } });

    expect(await screen.findByTestId('operator-option-0')).toBeInTheDocument();
  });
});
