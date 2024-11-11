import { getQueryWarning } from './useTenantTimezone';

describe('timezone query warning', () => {
  it.each([
    [null, null],
    [null, undefined],
    ['', null],
    ['', undefined],
    ['Narnia', null],
    ['Narnia', undefined],
    ['Narnia', 'Narnia'],
  ])('returns no warning for [%s,%s]', (a, b) => {
    expect(getQueryWarning(a, b)).toBeNull();
    expect(getQueryWarning(b, a)).toBeNull();
  });

  it('returns a warning for different timezones', () => {
    expect(getQueryWarning('Narnia', 'Atlantis')).not.toBeNull();
  });
});
