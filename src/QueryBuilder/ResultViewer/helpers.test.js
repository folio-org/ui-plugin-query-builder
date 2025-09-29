import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { getTableMetadata } from './helpers';
import { formatValueByDataType } from './utils';

jest.mock('./DynamicTable/DynamicTable', () => ({
  __esModule: true,
  DynamicTable: jest.fn(({ columns, values }) => (
    <div
      data-testid="dynamic-table"
      data-columns={JSON.stringify(columns)}
      data-values={JSON.stringify(values)}
    />
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
                { property: 'id', labelAlias: 'ID', hidden: false },
                { property: 'name', labelAlias: 'Name', hidden: true },
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

  it('does not set a width when there are no nested properties', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Title',
          name: 'title',
          visibleByDefault: false,
          dataType: { dataType: 'stringType', itemDataType: null },
        },
      ],
    };

    const { columnWidths } = getTableMetadata(entityType, [], intl);

    expect(columnWidths).toEqual({});
  });

  it('creates a mapping entry for every column', () => {
    const entityType = {
      columns: [
        { labelAlias: 'A', name: 'a', visibleByDefault: false, dataType: { dataType: 'stringType' } },
        { labelAlias: 'B', name: 'b', visibleByDefault: false, dataType: { dataType: 'stringType' } },
        { labelAlias: 'C', name: 'c', visibleByDefault: true, dataType: { dataType: 'stringType' } },
      ],
    };

    const { columnMapping } = getTableMetadata(entityType, [], intl);

    expect(columnMapping).toEqual({ a: 'A', b: 'B', c: 'C' });
  });

  it('merges forced visible columns with visibleByDefault (no duplicates)', () => {
    const entityType = {
      columns: [
        { labelAlias: 'X', name: 'x', visibleByDefault: true, dataType: { dataType: 'stringType' } },
        { labelAlias: 'Y', name: 'y', visibleByDefault: false, dataType: { dataType: 'stringType' } },
      ],
    };

    const { defaultVisibleColumns } = getTableMetadata(entityType, ['y', 'x'], intl);

    expect(defaultVisibleColumns.sort()).toEqual(['x', 'y'].sort());
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

  it('passes undefined through to formatter when value is missing', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Score',
          name: 'score',
          visibleByDefault: true,
          dataType: { dataType: 'numberType', itemDataType: null },
        },
      ],
    };
    const { formatter } = getTableMetadata(entityType, [], intl);
    const TestComponent = () => <>{formatter.score({})}</>;

    render(<TestComponent />);
    expect(formatValueByDataType).toHaveBeenCalledWith(
      undefined,
      'numberType',
      intl,
      { isInstanceLanguages: false },
    );
    expect(screen.getByText('formatted-value')).toBeInTheDocument();
  });

  it('sets isInstanceLanguages=true only for "instance.languages"', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Instance Languages',
          name: 'instance.languages',
          visibleByDefault: false,
          dataType: { dataType: 'arrayType', itemDataType: null },
        },
      ],
    };
    const { formatter } = getTableMetadata(entityType, [], intl);
    const TestComponent = () => <>{formatter['instance.languages']({ 'instance.languages': ['en', 'hr'] })}</>;

    render(<TestComponent />);
    expect(formatValueByDataType).toHaveBeenCalledWith(
      ['en', 'hr'],
      'arrayType',
      intl,
      { isInstanceLanguages: true },
    );
    expect(screen.getByText('formatted-value')).toBeInTheDocument();
  });

  it('renders a DynamicTable for columns with nested properties and parses JSON values', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Tags',
          name: 'tags',
          visibleByDefault: false,
          dataType: {
            dataType: 'arrayType',
            itemDataType: {
              properties: [
                { property: 'id', labelAlias: 'ID', dataType: { dataType: 'stringType' } },
                { property: 'name', labelAlias: 'Name', dataType: { dataType: 'stringType' } },
                { property: 'active', labelAlias: 'Active', dataType: { dataType: 'booleanType' } },
              ],
            },
          },
        },
      ],
    };

    const valuesJSON = JSON.stringify([
      { id: 't1', name: 'alpha', active: true },
      { id: 't2', name: 'beta', active: false },
    ]);

    const { formatter } = getTableMetadata(entityType, [], intl);
    const TestComponent = () => <>{formatter.tags({ tags: valuesJSON })}</>;

    render(<TestComponent />);

    const table = screen.getByTestId('dynamic-table');
    const passedColumns = JSON.parse(table.getAttribute('data-columns') || '[]');
    const passedValues = JSON.parse(table.getAttribute('data-values') || '[]');

    expect(passedColumns).toEqual([
      { id: 'id', name: 'ID', dataType: 'stringType', styles: { width: '180px', minWidth: '180px' } },
      { id: 'name', name: 'Name', dataType: 'stringType', styles: { width: '180px', minWidth: '180px' } },
      { id: 'active', name: 'Active', dataType: 'booleanType', styles: { width: '180px', minWidth: '180px' } },
    ]);

    expect(passedValues).toEqual([
      { id: 't1', name: 'alpha', active: true },
      { id: 't2', name: 'beta', active: false },
    ]);
  });

  it('computes columnWidths based on the number of nested properties (180px each)', () => {
    const entityType = {
      columns: [
        {
          labelAlias: 'Meta',
          name: 'meta',
          visibleByDefault: false,
          dataType: {
            dataType: 'arrayType',
            itemDataType: {
              properties: [
                { property: 'k', labelAlias: 'Key', dataType: { dataType: 'stringType' } },
                { property: 'v', labelAlias: 'Value', dataType: { dataType: 'stringType' } },
                { property: 't', labelAlias: 'Type', dataType: { dataType: 'stringType' } },
                { property: 'n', labelAlias: 'Note', dataType: { dataType: 'stringType' } },
              ],
            },
          },
        },
      ],
    };

    const { columnWidths } = getTableMetadata(entityType, [], intl);

    expect(columnWidths).toEqual({ meta: '720px' });
  });
});
