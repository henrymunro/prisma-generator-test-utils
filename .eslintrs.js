module.exports = {
  plugins: ["@typescript-eslint", "jest"],
  ignorePatterns: ["*.test.*", "*__tests__*", "prisma/**", "scripts/**"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jest/recommended",
  ],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
};
