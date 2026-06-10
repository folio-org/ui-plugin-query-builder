import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Intl from '../../../../../test/jest/__mock__/intlProvider.mock';
import { RootContext } from '../../../../context/RootContext';
import { DATA_OPTIONS_LOAD_FAILED } from '../../../../hooks/useDataOptions';
import { SelectionContainer } from './SelectionContainer';

const renderSelectionContainer = ({
  component,
  isMulti = false,
  availableValues,
  value,
  options = [],
  source,
  valueSourceApi,
  fallback,
  getDataOptionsWithFetching = () => options,
} = {}) => {
  return render(
    <Intl>
      <RootContext.Provider
        value={{
          getDataOptionsWithFetching,
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
          valueSourceApi={valueSourceApi}
          fallback={fallback}
        />
      </RootContext.Provider>
    </Intl>,
  );
};

const createFilteringComponent = (filterValues, options = [{ label: 'Apple' }]) => {
  const filterValuesByRender = [...filterValues];

  return jest.fn((props) => {
    const filterValue = filterValuesByRender.shift();

    if (filterValue) {
      props.onFilter(filterValue, options);
    }

    return null;
  });
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

  it('renders fallback when options failed to load', () => {
    const { getByTestId } = renderSelectionContainer({
      component: jest.fn(() => null),
      fallback: <div data-testid="fallback-input" />,
      getDataOptionsWithFetching: () => DATA_OPTIONS_LOAD_FAILED,
    });

    expect(getByTestId('fallback-input')).toBeVisible();
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

  it('single select returns a new array for punctuation-only search so Selection refreshes', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];
    const options = [
      { label: 'Apple' },
      { label: 'Banana' },
    ];
    const results = props.onFilter('!*?', options);

    expect(results).not.toBe(options);
    expect(results).toEqual(options);
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

  it('multi select exactMatch uses normalized labels', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      isMulti: true,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];

    const result = props.filter('Parent - Child', [
      { label: 'Parent — Child' },
    ]);

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

  it('formatter returns null when no selected option is present so the control placeholder can render', () => {
    const mockComponent = jest.fn(() => null);

    renderSelectionContainer({
      component: mockComponent,
      options: [],
    });

    const props = mockComponent.mock.calls[0][0];
    const element = props.formatter({ option: undefined });

    expect(element).toBeNull();
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

  it('passes valueSourceApi to getDataOptionsWithFetching', () => {
    const getDataOptionsWithFetching = jest.fn(() => []);
    const valueSourceApi = { path: '/value-source-api' };

    renderSelectionContainer({
      component: jest.fn(() => null),
      valueSourceApi,
      getDataOptionsWithFetching,
    });

    expect(getDataOptionsWithFetching).toHaveBeenCalledWith(
      'test',
      undefined,
      '',
      [],
      undefined,
      valueSourceApi,
    );
  });

  it('uses normalized filter text when fetching search options', async () => {
    const getDataOptionsWithFetching = jest.fn(() => []);
    const mockComponent = createFilteringComponent(['apple!']);

    renderSelectionContainer({
      component: mockComponent,
      getDataOptionsWithFetching,
    });

    await waitFor(() => expect(getDataOptionsWithFetching).toHaveBeenLastCalledWith(
      'test',
      undefined,
      'apple',
      [],
      undefined,
      undefined,
    ));
  });

  it('uses an empty search value when filter text changes to only ignored special characters', async () => {
    const getDataOptionsWithFetching = jest.fn(() => []);
    const mockComponent = createFilteringComponent(['apple!', '!*?']);

    renderSelectionContainer({
      component: mockComponent,
      getDataOptionsWithFetching,
    });

    await waitFor(() => {
      const emptySearchCalls = getDataOptionsWithFetching.mock.calls.filter(call => call[2] === '');

      expect(emptySearchCalls.length).toBeGreaterThan(1);
      expect(getDataOptionsWithFetching).toHaveBeenLastCalledWith(
        'test',
        undefined,
        '',
        [],
        undefined,
        undefined,
      );
    });
  });
});
