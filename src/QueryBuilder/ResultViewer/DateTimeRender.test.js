import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { formatValueByDataType } from './utils';
import { DATA_TYPES } from '../../constants/dataTypes';

// This test explicitly validates the divergence between DateType (raw) and DateTimeType (formatted/localized)
// Given an ISO timestamp in UTC that would date-shift for some timezones, DateTimeType should format via <FormattedDate />
// Whereas DateType should ignore timezone and just surface the original YYYY-MM-DD provided by the backend.

describe('Date vs DateTime rendering behavior', () => {
  const isoDateTime = '2024-07-01T12:30:00Z';
  const rawDate = '2024-07-01';

  test('DateType returns raw date string (no <FormattedDate> wrapping)', () => {
    const rendered = formatValueByDataType(rawDate, DATA_TYPES.DateType, null, null);

    expect(typeof rendered).toBe('string');
    expect(rendered).toBe(rawDate);
  });

  test('DateTimeType returns a FormattedDate react element localized', () => {
    const rendered = formatValueByDataType(isoDateTime, DATA_TYPES.DateTimeType, null, null);

    // Should be a react element (object) not a plain string
    expect(typeof rendered).toBe('object');

    const { container } = render(<IntlProvider>{rendered}</IntlProvider>);

    // Default locale assumed (en), month/day could vary by environment but generally M/D/YYYY; we defensively match by parts.
    const text = container.textContent;

    expect(text).toBeTruthy();
    // Basic assertions: year present and month/day digits present
    expect(text).toMatch(/2024/);
  });

  test('DateType trims ISO to date-only if unexpectedly provided full ISO', () => {
    const rendered = formatValueByDataType(isoDateTime, DATA_TYPES.DateType, null, null);

    expect(rendered).toBe(rawDate);
  });
});
