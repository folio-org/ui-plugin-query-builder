import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { ViewerHeadline } from './ViewerHeadline';
import { QUERY_DETAILS_STATUSES } from '../../../../constants/query';

const renderComponent = (props) => {
  return render(
    <IntlProvider locale="en">
      <ViewerHeadline {...props} />
    </IntlProvider>,
  );
};

describe('ViewerHeadline', () => {
  it('should render error message when status is "FAILED"', () => {
    renderComponent({
      limit: '10',
      total: 5,
      isInProgress: false,
      status: QUERY_DETAILS_STATUSES.FAILED,
    });

    expect(screen.getByText(/error.occurredMessage/i)).toBeInTheDocument();
  });

  it('should render empty message when total is 0', () => {
    renderComponent({
      limit: '10',
      total: 0,
      isInProgress: false,
      status: QUERY_DETAILS_STATUSES.SUCCESS,
    });

    expect(screen.getByText(/modal.preview.title.empty/i)).toBeInTheDocument();
  });

  it('should render total and limit message when total is greater than 0', () => {
    renderComponent({
      limit: '10',
      total: 5,
      isInProgress: false,
      status: QUERY_DETAILS_STATUSES.SUCCESS,
    });

    expect(screen.getByText(/modal.preview.title/i)).toBeInTheDocument();
  });

  it('should show loading spinner when isInProgress is true', () => {
    renderComponent({
      limit: '10',
      total: 5,
      isInProgress: true,
      status: QUERY_DETAILS_STATUSES.SUCCESS,
    });

    expect(screen.getByText(/modal.preview.countingInProgress/i)).toBeInTheDocument();
  });

  it('should not show loading spinner when isInProgress is false', () => {
    renderComponent({
      limit: '10',
      total: 5,
      isInProgress: false,
      status: QUERY_DETAILS_STATUSES.SUCCESS,
    });

    expect(screen.getByText(/modal.preview.title/i)).toBeInTheDocument();
  });
});
