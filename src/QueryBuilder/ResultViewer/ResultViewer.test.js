import { screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ResultViewer } from './ResultViewer';
import { entityType } from '../../../test/jest/data/entityType';
import { content } from '../../../test/jest/data/content';
import { delayedResponse } from '../../../test/jest/data/helpers';
import * as pagination from '../../hooks/usePagination';
import Intl from '../../../test/jest/__mock__/intl.mock';

const queryClient = new QueryClient();

const setVisibleColumns = jest.fn();
const setColumns = jest.fn();

const renderResultViewer = (props) => (
  <Intl locale="en">
    <QueryClientProvider client={queryClient}>
      <ResultViewer
        accordionHeadline="Query: loan_status ='Open' and user_active = 'false'"
        headline={({ totalRecords }) => `${totalRecords} records found`}
        contentDataSource={() => delayedResponse(300, content)}
        entityTypeDataSource={() => delayedResponse(300, entityType)}
        visibleColumns={['user_id']}
        onSetDefaultVisibleColumns={setVisibleColumns}
        onSetDefaultColumns={setColumns}
        height={300}
        {...props}
      />
    </QueryClientProvider>
  </Intl>
);

describe('ResultViewer', () => {
  it('Should render accordion title', async () => {
    render(renderResultViewer());

    await waitFor(() => {
      expect(screen.getByText("Query: loan_status ='Open' and user_active = 'false'")).toBeVisible();
    });
  });

  describe('Render accordion and titles', () => {
    it('should not render accordion if accordionHeadline prop is NULL', async () => {
      render(renderResultViewer({ accordionHeadline: null }));

      expect(screen.queryByTestId('results-viewer-accordion')).toBeNull();
    });

    it('should render subtitle with correct count of records', async () => {
      render(renderResultViewer({
        refreshTrigger: 1,
      }));

      await waitFor(() => {
        expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();

        expect(screen.getByText(`${content.totalRecords} records found`)).toBeVisible();
      });
    });
  });

  describe('Initial and visible columns setters', () => {
    it('should be called only once', async () => {
      render(renderResultViewer());

      await waitFor(() => {
        expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();

        expect(setVisibleColumns).toHaveBeenCalledTimes(1);
        expect(setColumns).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Records table', () => {
    const offset = 300;
    const limit = 200;
    const changePage = jest.fn();

    it('should be rendered with pagination', async () => {
      jest.spyOn(pagination, 'usePagination').mockImplementation(() => ({
        limit,
        offset,
        changePage,
      }));

      render(renderResultViewer({
        refreshTrigger: 1,
        defaultLimit: limit,
        defaultOffset: offset,
      }));

      await waitFor(() => {
        expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();
        expect(screen.getByRole('grid')).toBeVisible();
        expect(screen.getByText(new RegExp(`${offset + 1}`, 'i'))).toBeVisible();
        expect(screen.getByText(new RegExp(`${offset + limit}`, 'i'))).toBeVisible();
        expect(changePage).not.toBeCalled();
      });
    });
  });

  describe('Refresh functionality', () => {
    const offset = 300;
    const limit = 200;
    const changePage = jest.fn();

    it('should call changePage to #1 if refreshing triggered', async () => {
      jest.spyOn(pagination, 'usePagination').mockImplementationOnce(() => ({
        limit,
        offset,
        changePage,
      }));

      render(renderResultViewer({
        refreshTrigger: 1,
        defaultLimit: limit, // change default
        defaultOffset: offset + 100,
      }));

      await waitFor(() => {
        expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();

        expect(changePage).toBeCalled();
      });
    });
  });
});
