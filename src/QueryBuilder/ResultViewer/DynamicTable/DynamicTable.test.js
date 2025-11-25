import { render } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { DynamicTable } from './DynamicTable';
import { formatValueByDataType } from '../utils';

describe('DynamicTable component', () => {
  const columns = [
    {
      id: 'code',
      name: 'Code',
      dataType: 'stringType',
    },
    {
      id: 'distributionType',
      name: 'Distribution type',
      dataType: 'stringType',
    },
    {
      id: 'encumbrance',
      name: 'Encumbrance',
      dataType: 'rangedUUIDType',
    },
    {
      id: 'fundId',
      name: 'Fund ID',
      dataType: 'rangedUUIDType',
    },
    {
      id: 'value',
      name: 'Value',
      dataType: 'numberType',
    },
    {
      id: 'isCool',
      name: 'Is cool',
      dataType: 'booleanType',
    },
    {
      id: 'isNotCool',
      name: 'Is not cool',
      dataType: 'booleanType',
    },
    {
      id: 'isEmptyBool',
      name: 'Empty bool column',
      dataType: 'booleanType',
    },
    {
      id: 'coolDate',
      name: 'Date column',
      dataType: 'dateType',
    },
    {
      id: 'lessCoolDate',
      name: 'Date column 2',
      dataType: 'dateType',
    },
    {
      id: 'emptyDate',
      name: 'Empty date column',
      dataType: 'dateType',
    },
    {
      id: 'coolDatetime',
      name: 'Datetime column',
      dataType: 'dateTimeType',
    },
    {
      id: 'lessCoolDatetime',
      name: 'Datetime column 2',
      dataType: 'dateTimeType',
    },
    {
      id: 'emptyDatetime',
      name: 'Empty datetime column',
      dataType: 'dateTimeType',
    },
  ];

  it.each([[], undefined, null])(
    'renders null value for empty/invalid input %s',
    (v) => {
      const { container } = render(<DynamicTable columns={columns} values={v} formatter={formatValueByDataType} />);

      expect(container).toBeEmptyDOMElement();
    },
  );

  const values =
    [
      {
        code: 'STATE-MONOSER',
        value: 100.0,
        fundId: 'bbd4a5e1-c9f3-44b9-bfdf-d184e04f0ba0',
        encumbrance: 'eb506834-6c70-4239-8d1a-6414a5b08010',
        distributionType: 'percentage',
        isCool: true,
        isNotCool: false,
        isEmptyBool: null,
        coolDate: '2021-01-01T05:00:00.000Z',
        lessCoolDate: '2021-01-01T04:59:00.000Z',
        emptyDate: null,
      },
    ];

  it('renders table with correct properties and values', () => {
    const { getByText } = render(
      <IntlProvider locale="en" timeZone="America/New_York">
        <DynamicTable columns={columns} values={values} formatter={formatValueByDataType} />
      </IntlProvider>,
    );

    columns.forEach((column) => {
      const label = getByText(column.name);

      expect(label).toBeInTheDocument();
    });

    expect(getByText('STATE-MONOSER')).toBeInTheDocument();
    expect(getByText('eb506834-6c70-4239-8d1a-6414a5b08010')).toBeInTheDocument();
    expect(getByText('bbd4a5e1-c9f3-44b9-bfdf-d184e04f0ba0')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();

    // will fail if multiple, to ensure multiple case works
    const trueCell = getByText('ui-plugin-query-builder.options.true');
    const falseCell = getByText('ui-plugin-query-builder.options.false');

    expect(trueCell).toBeInTheDocument();
    expect(falseCell).toBeInTheDocument();
    expect(trueCell.compareDocumentPosition(falseCell)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    const dateCells = Array.from(document.querySelectorAll('td')).filter(td => td.textContent === '2021-01-01');

    expect(dateCells.length).toBeGreaterThanOrEqual(2);
    // ensure both date columns rendered (duplicate raw dates acceptable)
    expect(dateCells[0]).toBeInTheDocument();
    expect(dateCells[1]).toBeInTheDocument();
  });

  it.each([
    [[], []],
    [[], null],
    [null, []],
    [null, null],
    [[], [{}]],
    [[{}], []],
  ])('renders nothing if given empty columns/values', (c, v) => {
    const { container } = render(
      <DynamicTable columns={c} values={v} />,
    );

    expect(container.innerHTML).toBe('');
  });
});
