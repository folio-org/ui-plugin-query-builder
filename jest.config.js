const commonCofig = require('@folio/stripes-acq-components/jest.config');
const path = require('path');

module.exports = {
  ...commonCofig,
  setupFiles: [
    path.join(__dirname, './test/jest/setupTests.js'),
    'jest-canvas-mock',
  ],
  setupFilesAfterEnv: [path.join(__dirname, './test/jest/jest.setup.js')],
};
