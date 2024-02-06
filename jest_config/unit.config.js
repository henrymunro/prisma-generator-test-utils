/* eslint-disable no-undef */

module.exports = {
  displayName: "unit",
  rootDir: "..",
  roots: ["<rootDir>/src"],
  preset: "ts-jest",
  moduleNameMapper: {},
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      // Disables type checking when running tests
      isolatedModules: true,
    },
  },
};
