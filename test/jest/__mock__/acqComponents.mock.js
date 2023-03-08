jest.mock('@folio/stripes-acq-components', () => ({
  PrevNextPagination: jest.fn(({ limit, offset }) => <span>{`${offset}-${limit}`}</span>),
}));
