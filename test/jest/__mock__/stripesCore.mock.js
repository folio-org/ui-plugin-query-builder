import ky from 'ky';

jest.doMock('@folio/stripes/core', () => {
  return {
    IfInterface: jest.fn(({ name, children }) => {
      return name === 'interface' ? children : null;
    }),
    IfPermission: jest.fn(({ perm, children }) => {
      return perm === 'permission' ? children : null;
    }),
    Pluggable: jest.fn(({ children }) => [children]),
    AppIcon: jest.fn(({ ariaLabel }) => <span>{ariaLabel}</span>),
    useOkapiKy: () => ky.create({
      prefixUrl: 'https://test.c',
    }),
  };
});
