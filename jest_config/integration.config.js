/* eslint-disable no-undef */

module.exports = {
  displayName: "integration",
  rootDir: "..",
  roots: ["<rootDir>/__tests__"],
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
