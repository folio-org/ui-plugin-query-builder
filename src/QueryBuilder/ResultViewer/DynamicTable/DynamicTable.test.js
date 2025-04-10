import { render } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { DynamicTable } from './DynamicTable';

describe('DynamicTable component', () => {
  const properties = [
    {
      name: 'code',
      dataType: {
        dataType: 'stringType',
      },
      labelAlias: 'Code',
      property: 'code',
    },
    {
      name: 'distribution_type',
      dataType: {
        dataType: 'stringType',
      },
      labelAlias: 'Distribution type',
      property: 'distributionType',
    },
    {
      name: 'encumbrance',
      dataType: {
        dataType: 'rangedUUIDType',
      },
      labelAlias: 'Encumbrance',
      property: 'encumbrance',
    },
    {
      name: 'fund_id',
      dataType: {
        dataType: 'rangedUUIDType',
      },
      labelAlias: 'Fund ID',
      property: 'fundId',
    },
    {
      name: 'value',
      dataType: {
        dataType: 'numberType',
      },
      labelAlias: 'Value',
      property: 'value',
    },
    {
      name: 'is_cool',
      dataType: {
        dataType: 'booleanType',
      },
      labelAlias: 'Is cool',
      property: 'isCool',
    },
    {
      name: 'is_not_cool',
      dataType: {
        dataType: 'booleanType',
      },
      labelAlias: 'Is not cool',
      property: 'isNotCool',
    },
    {
      name: 'is_empty_bool',
      dataType: {
        dataType: 'booleanType',
      },
      labelAlias: 'Empty bool column',
      property: 'isEmptyBool',
    },
    {
      name: 'cool_date',
      dataType: {
        dataType: 'dateType',
      },
      labelAlias: 'Date column',
      property: 'coolDate',
    },
    {
      name: 'less_cool_date',
      dataType: {
        dataType: 'dateType',
      },
      labelAlias: 'Date column 2',
      property: 'lessCoolDate',
    },
    {
      name: 'empty_date',
      dataType: {
        dataType: 'dateType',
      },
      labelAlias: 'Empty date column',
      property: 'emptyDate',
    },
  ];

  it.each(['[]', undefined, null])(
    'renders null value for empty/invalid input %s',
    (v) => {
      const { container } = render(<DynamicTable properties={properties} values={v} />);

      expect(container).toBeEmptyDOMElement();
    },
  );

  const values = `
    [
      {
        "code": "STATE-MONOSER",
        "value": 100.0,
        "fundId": "bbd4a5e1-c9f3-44b9-bfdf-d184e04f0ba0",
        "encumbrance": "eb506834-6c70-4239-8d1a-6414a5b08010",
        "distributionType": "percentage",
        "isCool": true,
        "isNotCool": false,
        "isEmptyBool": null,
        "coolDate": "2021-01-01T05:00:00.000Z",
        "lessCoolDate": "2021-01-01T04:59:00.000Z",
        "emptyDate": null
      }
    ]`;

  it('renders table with correct properties and values', () => {
    const { getByText } = render(
      <IntlProvider timeZone="America/New_York">
        <DynamicTable properties={properties} values={values} />
      </IntlProvider>,
    );

    properties.forEach((property) => {
      const label = getByText(property.labelAlias);

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

    const coolDateCell = getByText('1/1/2021'); // after midnight in EST
    const lessCoolDateCell = getByText('12/31/2020'); // before midnight in EST

    expect(coolDateCell).toBeInTheDocument();
    expect(lessCoolDateCell).toBeInTheDocument();
    expect(coolDateCell.compareDocumentPosition(lessCoolDateCell)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
