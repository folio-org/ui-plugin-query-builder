import { screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ResultViewer } from './ResultViewer';
import { entityType } from '../../../test/jest/data/entityType';
import { content } from '../../../test/jest/data/content';
import { delayedResponse } from '../../../test/jest/helpers';

const queryClient = new QueryClient();

const setVisibleColumns = jest.fn();
const setColumns = jest.fn();

const renderResultViewer = (props) => (
  <QueryClientProvider client={queryClient}>
    <ResultViewer
      accordionHeadline="Query: loan_status ='Open' and user_active = 'false'"
      headline={({ totalElements }) => `${totalElements} records found`}
      contentDataSource={() => delayedResponse(300, content)}
      entityTypeDataSource={() => delayedResponse(300, entityType)}
      visibleColumns={[]}
      onSetDefaultVisibleColumns={setVisibleColumns}
      onSetDefaultColumns={setColumns}
      height={300}
      {...props}
    />
  </QueryClientProvider>
);

describe('ResultViewer', () => {
  it('should render loading', async () => {
    render(renderResultViewer());

    expect(screen.getByText('Loading')).toBeVisible();
  });

  describe('Render accordion and titles', () => {
    it('should render accordion if accordionHeadline prop is present', async () => {
      render(renderResultViewer());

      expect(screen.getByTestId('results-viewer-accordion')).toBeVisible();
    });

    it('should not render accordion if accordionHeadline prop is NULL', async () => {
      render(renderResultViewer({ accordionHeadline: null }));

      expect(screen.queryByTestId('results-viewer-accordion')).toBeNull();
    });

    it('should render subtitle with correct count of records', async () => {
      render(renderResultViewer());

      await waitFor(() => {
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();

        expect(screen.getByText(`${content.totalElements} records found`)).toBeVisible();
      });
    });
  });

  describe('Initial and visible columns setters', () => {
    it('should be called only once', async () => {
      render(renderResultViewer());

      await waitFor(() => {
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();

        expect(setVisibleColumns).toHaveBeenCalledTimes(1);
        expect(setColumns).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Records table', () => {
    it('should be rendered with pagination', async () => {
      render(renderResultViewer());

      await waitFor(() => {
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();

        expect(screen.getByTestId('results-viewer-table')).toBeVisible();
        expect(screen.getByText('Pagination')).toBeVisible();
      });
    });
  });
});
