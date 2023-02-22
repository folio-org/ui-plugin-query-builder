import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryBuilderPlugin } from './QueryBuilderPlugin';

jest.mock('./ResultViewer', () => ({
  ResultViewer: jest.fn(() => <div data-testid="viewer" />),
}));

jest.mock('./QueryBuilder', () => ({
  QueryBuilder: jest.fn(() => <div data-testid="builder" />),
}));

describe('Should render different parts of plugin based on componentType', () => {
  it('should render ResultsViewer', () => {
    render(<QueryBuilderPlugin componentType="viewer" />);

    expect(screen.getByTestId('viewer')).toBeVisible();
  });

  it('should render QueryBuilderModal', () => {
    render(<QueryBuilderPlugin componentType="builder" />);

    expect(screen.getByTestId('builder')).toBeVisible();
  });
});
