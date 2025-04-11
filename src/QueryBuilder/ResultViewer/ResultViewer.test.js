import { screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ResultViewer } from './ResultViewer';
import { entityType } from '../../../test/jest/data/entityType';
import { content } from '../../../test/jest/data/content';
import { delayedResponse } from '../../../test/jest/data/helpers';
import * as pagination from '../../hooks/usePagination';
import Intl from '../../../test/jest/__mock__/intlProvider.mock';
import { RootContext } from '../../context/RootContext';

const queryClient = new QueryClient();

const setVisibleColumns = jest.fn();
const setColumns = jest.fn();
const refetchIntervalMock = jest.fn();
const completeExecutionMock = jest.fn();
const onSuccessMock = jest.fn();

const renderResultViewer = (props) => (
  <Intl locale="en">
    <QueryClientProvider client={queryClient}>
      <RootContext.Provider value={{ setVisibleColumns: () => {}, getDataOptions: () => [] }}>
        <ResultViewer
          showQueryAccordion
          fqlQuery={{
            $and: [
              { loan_status: { $eq: 'Open' } },
              { user_active: { $eq: false } },
            ],
          }}
          entityType={entityType}
          getParamsSource={() => []}
          headline={({ totalRecords }) => `${totalRecords} records found`}
          contentDataSource={() => delayedResponse(300, content)}
          entityTypeDataSource={() => delayedResponse(300, entityType)}
          visibleColumns={['user_id']}
          onSetDefaultVisibleColumns={setVisibleColumns}
          onSetDefaultColumns={setColumns}
          height={300}
          onSuccess={onSuccessMock}
          refreshInProgress={false}
          forcedVisibleValues={['username']}
          contentQueryOptions={{
            refetchInterval: refetchIntervalMock,
            completeExecution: completeExecutionMock,
          }}
          {...props}
        />
      </RootContext.Provider>
    </QueryClientProvider>
  </Intl>
);

describe('ResultViewer', () => {
  beforeEach(() => {
    setVisibleColumns.mockClear();
    setColumns.mockClear();
  });

  it('Should render accordion title', async () => {
    render(renderResultViewer());

    await waitFor(() => {
      expect(screen.getByText('ui-plugin-query-builder.viewer.accordion.title.query')).toBeVisible();
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
    it('should call both when no initial fields are provided (recordColumns=%s)', async () => {
      render(renderResultViewer({ visibleColumns: ['user_id'] }));

      await waitFor(() => {
        expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();

        expect(setVisibleColumns).not.toHaveBeenCalled();
        expect(setColumns).not.toHaveBeenCalled();
      });
    });

    it('should call initial column setter when initial fields are changed', async () => {
      render(renderResultViewer({ visibleColumns: ['user_id'] }));

      await waitFor(() => {
        expect(screen.queryByText('ui-plugin-query-builder.viewer.retrieving')).not.toBeInTheDocument();

        expect(setColumns).not.toHaveBeenCalled();
        expect(setVisibleColumns).not.toHaveBeenCalled();
      });
    });
  });

  describe('Records table', () => {
    const offset = 300;
    const limit = 200;
    const changePage = jest.fn();

    it('should format language name shortcuts to full name', async () => {
      render(renderResultViewer({ visibleColumns:
          ['instance.languages', 'user_expiration_date', 'department_names', 'decimal_position', 'user_id'] }));

      await waitFor(() => {
        expect(screen.queryByText('ui-plugin-query-builder.result.inProgress')).not.toBeInTheDocument();

        expect(screen.queryByText('Languages')).toBeVisible();
        expect(screen.queryByText('English | French')).toBeVisible();
      });
    });

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
