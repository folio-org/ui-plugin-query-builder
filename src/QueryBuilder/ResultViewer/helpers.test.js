import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { getTableMetadata, handleDeletedRecords } from './helpers';
import { formatValueByDataType } from './utils';

jest.mock('./utils', () => ({
  __esModule: true,
  formatValueByDataType: jest.fn(() => 'formatted-value'),
}));

jest.mock('react-intl', () => ({
  FormattedMessage: ({ id }) => id,
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
      undefined,
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
      undefined,
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
      undefined,
      intl,
      { isInstanceLanguages: true },
    );
    expect(screen.getByText('formatted-value')).toBeInTheDocument();
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

describe('handleDeletedRecords', () => {
  it.each([[], null, undefined])('does nothing when data=%p', (data) => {
    const result = handleDeletedRecords(data, []);

    expect(result).toEqual(data);
  });

  it('does nothing without deleted records', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const result = handleDeletedRecords(data, ['id', 'name']);

    expect(result).toEqual(data);
  });

  describe('deleted row transformations', () => {
    let testData;
    let input;

    beforeEach(() => {
      testData = [
        { id: 1, name: 'Alice', username: 'alice1', active: true },
        { id: 2, _deleted: true },
      ];
      // clone to prevent assertions against modified sources
      input = JSON.parse(JSON.stringify(testData));
    });

    it('only alters deleted records', () => {
      const result = handleDeletedRecords(input, [
        'id',
        'name',
        'something_else',
      ]);

      expect(result[0]).toEqual(testData[0]);
      expect(result[1]).not.toEqual(testData[1]);
    });

    it('leaves existing fields in place ([ID] only)', () => {
      const result = handleDeletedRecords(input, ['id']);

      expect(result[0]).toEqual(testData[0]);
      expect(result[1]).toEqual(testData[1]); // no empty fields to decorate
    });

    it('adds deleted field indicators: ([ID, missing, missing])', () => {
      const result = handleDeletedRecords(input, ['id', 'name', 'something_else']);

      expect(result[0]).toEqual(testData[0]);
      expect(render(result[1].name).container).toHaveTextContent('deletedRecord.rowLabel');
      expect(render(result[1].something_else).container).toHaveTextContent('deletedRecord.emptyField');
    });

    it('adds deleted field indicators: ([ID, missing])', () => {
      const result = handleDeletedRecords(input, ['id', 'name']);

      expect(result[0]).toEqual(testData[0]);
      expect(render(result[1].name).container).toHaveTextContent('deletedRecord.rowLabel');
    });

    it('adds deleted field indicators: ([missing])', () => {
      const result = handleDeletedRecords(input, ['name']);

      expect(result[0]).toEqual(testData[0]);
      expect(render(result[1].name).container).toHaveTextContent('deletedRecord.rowLabel');
    });

    it('adds deleted field indicators: ([missing, missing])', () => {
      const result = handleDeletedRecords(input, ['name', 'something_else']);

      expect(result[0]).toEqual(testData[0]);
      expect(render(result[1].name).container).toHaveTextContent('deletedRecord.rowLabel');
      expect(render(result[1].something_else).container).toHaveTextContent('deletedRecord.emptyField');
    });

    it('adds deleted field indicators: ([missing, ID, missing])', () => {
      const result = handleDeletedRecords(input, ['name', 'id', 'something_else']);

      expect(result[0]).toEqual(testData[0]);
      expect(render(result[1].name).container).toHaveTextContent('deletedRecord.rowLabel');
      expect(render(result[1].something_else).container).toHaveTextContent('deletedRecord.emptyField');
    });
  });
});
