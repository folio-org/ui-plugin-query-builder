import { render } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { DynamicTable } from './DynamicTable';

describe('DynamicTable component', () => {
  const properties = [
    { labelAlias: 'Code', property: 'code' },
    { labelAlias: 'Distribution Type', property: 'distributionType' },
    { labelAlias: 'Encumbrance', property: 'encumbrance' },
    { labelAlias: 'Fund ID', property: 'fundId' },
    { labelAlias: 'Value', property: 'value' },
    { labelAlias: 'Is Cool', property: 'isCool' },
    { labelAlias: 'Is Not Cool', property: 'isNotCool' },
    { labelAlias: 'Date Column', property: 'coolDate' },
  ];

  const formattedValues = [
    ['STATE-MONOSER', 'Percentage', 'Encumbrance Value', 'Fund ID Value', '100', 'Yes', 'No', '01/01/2021'],
  ];

  it('renders correctly with formatted values', () => {
    const { getByText } = render(
      <IntlProvider locale="en">
        <DynamicTable properties={properties} values={formattedValues} />
      </IntlProvider>,
    );

    properties.forEach((property) => {
      expect(getByText(property.labelAlias)).toBeInTheDocument();
    });

    formattedValues.forEach((row) => {
      Object.values(row).forEach((value) => {
        expect(getByText(value)).toBeInTheDocument();
      });
    });
  });

  it('renders null for empty values', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <DynamicTable properties={properties} values={[]} />
      </IntlProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
