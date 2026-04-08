// =============================================================================
// Shared ESLint Configuration
// Used by all apps and packages in the monorepo.
// Extend this in each package's .eslintrc.js:
//   module.exports = require("@throttlr/config/eslint");
// =============================================================================

/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "no-console": "warn",
  },
  ignorePatterns: ["dist/", "node_modules/", "*.js"],
};
