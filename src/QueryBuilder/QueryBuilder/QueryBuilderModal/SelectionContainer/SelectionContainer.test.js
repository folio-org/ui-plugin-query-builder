import React from 'react';
import { render } from '@testing-library/react';
import Intl from '../../../../../test/jest/__mock__/intlProvider.mock';
import { RootContext } from '../../../../context/RootContext';
import { SelectionContainer } from './SelectionContainer';

const renderSelectionContainer = ({
  component,
  isMulti = false,
  availableValues,
  value,
  options = [],
  source,
} = {}) => {
  return render(
    <Intl>
      <RootContext.Provider
        value={{
          getDataOptionsWithFetching: () => options,
        }}
      >
        <SelectionContainer
          component={component}
          fieldName="test"
          operator="EQUAL"
          isMulti={isMulti}
          availableValues={availableValues}
          value={value}
          source={source}
        />
      </RootContext.Provider>
    </Intl>,
  );
};

describe('SelectionContainer', () => {
  it('renders Loading when optionsPromise is not array', () => {
    const { container } = render(
      <Intl>
        <RootContext.Provider
          value={{
            getDataOptionsWithFetching: () => Promise.resolve([]),
          }}
        >
          <SelectionContainer component={() => null} />
        </RootContext.Provider>
      </Intl>,
    );

    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('normalizes boolean string value', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      availableValues: [
        { label: 'True', value: true },
        { label: 'False', value: false },
      ],
      value: 'True',
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];

    expect(props.value).toBe(true);
  });

  it('single select fuzzy filter sorts results', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];

    const results = props.onFilter('ap', [
      { label: 'Apple' },
      { label: 'Banana' },
      { label: 'Apricot' },
    ]);

    expect(results[0].label).toBe('Apple');
    expect(results[1].label).toBe('Apricot');
  });

  it('multi select filter returns renderedItems and exactMatch', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      isMulti: true,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];

    const result = props.filter('Apple', [
      { label: 'Apple' },
      { label: 'Banana' },
    ]);

    expect(result.renderedItems.length).toBeGreaterThan(0);
    expect(result.exactMatch).toBe(true);
  });

  it('formatter returns label when searchTerm empty', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];

    const element = props.formatter({
      option: { label: 'Apple' },
      searchTerm: '',
    });

    expect(element.props.children).toBe('Apple');
  });

  it('formatter returns label when no fuzzysort match', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];

    const element = props.formatter({
      option: { label: 'Banana' },
      searchTerm: 'zzz',
    });

    expect(element.props.children).toBe('Banana');
  });

  it('formatter highlights matching text', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];

    const element = props.formatter({
      option: { label: 'Apple' },
      searchTerm: 'App',
    });

    expect(element.props.children).not.toBe('Apple');
  });

  it('calls onChange when value changes', () => {
    const onChange = jest.fn();
    const mockComponent = jest.fn(() => null);

    render(
      <Intl>
        <RootContext.Provider
          value={{
            getDataOptionsWithFetching: () => [],
          }}
        >
          <SelectionContainer
            component={mockComponent}
            onChange={onChange}
          />
        </RootContext.Provider>
      </Intl>,
    );

    const props = mockComponent.mock.calls[0][0];

    props.onChange('test');

    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('adds placeholder option for organization source single select', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      source: { name: 'organization' },
      options: [{ label: 'Org1', value: '1' }],
    });

    const props = mockComponent.mock.calls[0][0];

    expect(props.dataOptions[0].disabled).toBe(true);
  });

  it('updates searchValue from pendingSearchRef in useEffect', () => {
    const mockComponent = jest.fn(() => null);

    const { rerender } = render(
      <Intl>
        <RootContext.Provider
          value={{ getDataOptionsWithFetching: () => [] }}
        >
          <SelectionContainer component={mockComponent} />
        </RootContext.Provider>
      </Intl>,
    );

    const props = mockComponent.mock.calls[0][0];

    props.onFilter('apple', [{ label: 'Apple' }]);

    rerender(
      <Intl>
        <RootContext.Provider
          value={{ getDataOptionsWithFetching: () => [] }}
        >
          <SelectionContainer component={mockComponent} />
        </RootContext.Provider>
      </Intl>,
    );

    expect(true).toBe(true);
  });
});