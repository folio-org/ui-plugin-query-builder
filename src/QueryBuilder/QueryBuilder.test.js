import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryBuilder } from './QueryBuilder';

jest.mock('./ResultViewer', () => ({
  ResultViewer: jest.fn(() => <div data-testid="viewer" />),
}));

jest.mock('./QueryBuilderModal', () => ({
  QueryBuilderModal: jest.fn(() => <div data-testid="builder" />),
}));

describe('Should render different parts of plugin based on componentType', () => {
  it('should render ResultsViewer', () => {
    render(<QueryBuilder componentType="viewer" />);

    expect(screen.getByTestId('viewer')).toBeVisible();
  });

  it('should render QueryBuilderModal', () => {
    render(<QueryBuilder componentType="builder" />);

    expect(screen.getByTestId('builder')).toBeVisible();
  });
});
