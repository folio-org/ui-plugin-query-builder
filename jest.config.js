const commonCofig = require('@folio/stripes-acq-components/jest.config');
const path = require('path');

module.exports = {
  ...commonCofig,
  testEnvironment: 'jsdom',
  setupFiles: [
    path.join(__dirname, './test/jest/setupTests.js'),
    'jest-canvas-mock',
  ],
  setupFilesAfterEnv: [path.join(__dirname, './test/jest/jest.setup.js')],
  moduleNameMapper: {
    '^.+\\.(css|svg)$': 'identity-obj-proxy',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: ['**/(lib|src)/**/?(*.)test.{js,jsx}'],
  testPathIgnorePatterns: ['/node_modules/'],
};
