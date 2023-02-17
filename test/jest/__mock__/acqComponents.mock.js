jest.mock('@folio/stripes-acq-components', () => ({
  PrevNextPagination: jest.fn(() => <span>Pagination</span>),
}));
