import { OPERATORS, BOOLEAN_OPERATORS } from '../../../constants/operators';
import {
  OPERATOR_VALUE_TO_KEY,
  getBooleanOperatorLabel,
  getOperatorLabel,
  getOperatorSymbol,
} from './operatorLabels';

const intl = { formatMessage: jest.fn(({ id }) => id) };

beforeEach(() => intl.formatMessage.mockClear());

describe('OPERATOR_VALUE_TO_KEY', () => {
  it('maps operator values back to their enum keys', () => {
    expect(OPERATOR_VALUE_TO_KEY[OPERATORS.EQUAL]).toBe('EQUAL');
    expect(OPERATOR_VALUE_TO_KEY[OPERATORS.NOT_IN]).toBe('NOT_IN');
    expect(OPERATOR_VALUE_TO_KEY[OPERATORS.GREATER_THAN_OR_EQUAL]).toBe('GREATER_THAN_OR_EQUAL');
  });
});

describe('getOperatorLabel', () => {
  it('resolves the translation id for a known operator', () => {
    expect(getOperatorLabel(OPERATORS.IN, intl)).toBe('ui-plugin-query-builder.operators.IN');
    expect(intl.formatMessage).toHaveBeenCalledWith({ id: 'ui-plugin-query-builder.operators.IN' });
  });

  it('returns the raw value for an unknown operator', () => {
    expect(getOperatorLabel('???', intl)).toBe('???');
    expect(intl.formatMessage).not.toHaveBeenCalled();
  });
});

describe('getOperatorSymbol', () => {
  it('resolves the compact (symbol) translation id, not the verbose one', () => {
    expect(getOperatorSymbol(OPERATORS.GREATER_THAN, intl)).toBe('ui-plugin-query-builder.operators.symbol.GREATER_THAN');
    expect(intl.formatMessage).toHaveBeenCalledWith({ id: 'ui-plugin-query-builder.operators.symbol.GREATER_THAN' });
  });

  it('returns the raw value for an unknown operator', () => {
    expect(getOperatorSymbol('???', intl)).toBe('???');
  });
});

describe('getBooleanOperatorLabel', () => {
  it('resolves the boolean operator translation id', () => {
    expect(getBooleanOperatorLabel(BOOLEAN_OPERATORS.AND, intl))
      .toBe('ui-plugin-query-builder.operators.boolean.$and');
  });

  it('returns the raw value for an unknown boolean operator', () => {
    expect(getBooleanOperatorLabel('$or', intl)).toBe('$or');
  });
});
