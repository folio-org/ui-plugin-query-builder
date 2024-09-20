import React from 'react';
import { render } from '@testing-library/react';
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
  ];

  it.each(['[]', 'null', 'undefined', undefined, null])(
    'renders null value for empty/invalid input %s',
    (v) => {
      const { container } = render(<DynamicTable properties={properties} values={v} />);

      expect(container).toBeEmptyDOMElement();
    },
  );

  const values =
    '[{"code": "STATE-MONOSER", "value": 100.0, "fundId": "bbd4a5e1-c9f3-44b9-bfdf-d184e04f0ba0", "encumbrance": "eb506834-6c70-4239-8d1a-6414a5b08010", "distributionType": "percentage"}]';

  it('renders table with correct properties and values', () => {
    const { getByText } = render(<DynamicTable properties={properties} values={values} />);

    properties.forEach((property) => {
      const label = getByText(property.labelAlias);

      expect(label).toBeInTheDocument();
    });

    const codeValue = getByText('STATE-MONOSER');

    expect(codeValue).toBeInTheDocument();

    const encumbranceValue = getByText('eb506834-6c70-4239-8d1a-6414a5b08010');

    expect(encumbranceValue).toBeInTheDocument();

    const fundIdValue = getByText('bbd4a5e1-c9f3-44b9-bfdf-d184e04f0ba0');

    expect(fundIdValue).toBeInTheDocument();

    const numberValue = getByText('100');

    expect(numberValue).toBeInTheDocument();
  });
});
