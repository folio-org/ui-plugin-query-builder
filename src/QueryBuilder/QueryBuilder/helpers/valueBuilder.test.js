import { valueBuilder } from './valueBuilder';
import { DATA_TYPES } from '../constants/dataTypes';

describe('valueBuilder', () => {
  it('should return value in double quotes', () => {
    expect(valueBuilder('test', DATA_TYPES.StringType)).toBe('test');
  });
});