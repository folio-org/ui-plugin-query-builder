import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { getTableMetadata } from './helpers';
import { formatValueByDataType } from './utils';

jest.mock('./DynamicTable/DynamicTable', () => ({
  __esModule: true,
  DynamicTable: jest.fn(({ properties, values }) => (
    <div data-testid="dynamic-table" data-properties={JSON.stringify(properties)} data-values={JSON.stringify(values)} />
  )),
}));

jest.mock('./utils', () => ({
  __esModule: true,
  formatValueByDataType: jest.fn(() => 'formatted-value'),
}));

describe('getTableMetadata (pure metadata)', () => {
  const intl = { locale: 'en' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty metadata when no columns provided', () => {
    const meta = getTableMetadata(null, null, intl);

    expect(meta.defaultColumns).toEqual([]);
    expect(meta.columnMapping).toEqual({});
    expect(meta.columnWidths).toEqual({});
    expect(meta.defaultVisibleColumns).toEqual([]);
    expect(meta.formatter).toEqual({});
  });

  it('computes defaultColumns, mapping, widths, and visibility correctly', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Languages',
          name: 'languages',
          visibleByDefault: true,
          dataType: { dataType: 'arrayType', itemDataType: null },
        },
        {
          labelAlias: 'Tags',
          name: 'tags',
          visibleByDefault: false,
          dataType: {
            dataType: 'arrayType',
            itemDataType: {
              properties: [
                { name: 'id', hidden: false },
                { name: 'name', hidden: true },
              ],
            },
          },
        },
      ],
    };
    const forcedVisible = ['tags'];
    const {
      defaultColumns,
      columnMapping,
      columnWidths,
      defaultVisibleColumns,
    } = getTableMetadata(entityType, forcedVisible, intl);

    expect(defaultColumns).toHaveLength(2);
    expect(columnMapping).toEqual({ languages: 'Languages', tags: 'Tags' });
    expect(columnWidths).toEqual({ tags: '360px' });
    expect(defaultVisibleColumns.sort()).toEqual(['languages', 'tags'].sort());
  });
});

describe('getTableMetadata.formatter (rendered output)', () => {
  const intl = { locale: 'en' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders formatted text for simple dataType columns', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Age',
          name: 'age',
          visibleByDefault: true,
          dataType: { dataType: 'numberType', itemDataType: null },
        },
      ],
    };
    const { formatter } = getTableMetadata(entityType, [], intl);
    const TestComponent = () => <>{formatter.age({ age: 42 })}</>;

    render(<TestComponent />);
    expect(formatValueByDataType).toHaveBeenCalledWith(
      42,
      'numberType',
      intl,
      { isInstanceLanguages: false },
    );
    expect(screen.getByText('formatted-value')).toBeInTheDocument();
  });

  it('renders a DynamicTable with only non-hidden properties', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Attributes',
          name: 'attributes',
          visibleByDefault: false,
          dataType: {
            dataType: 'arrayType',
            itemDataType: {
              properties: [
                { name: 'id', hidden: false },
                { name: 'name', hidden: true },
                { name: 'tag', hidden: false },
              ],
            },
          },
        },
      ],
    };
    const { formatter } = getTableMetadata(entityType, [], intl);

    render(<>{formatter.attributes({ attributes: { id: 1, name: 2, tag: 3 } })}</>);

    const dyn = screen.getByTestId('dynamic-table');

    expect(dyn).toBeInTheDocument();

    const props = JSON.parse(dyn.getAttribute('data-properties'));

    expect(props).toEqual([
      { name: 'id', hidden: false },
      { name: 'tag', hidden: false },
    ]);

    expect(JSON.parse(dyn.getAttribute('data-values'))).toEqual({
      id: 1,
      name: 2,
      tag: 3,
    });
  });
});
