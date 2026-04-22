/** @type {import("eslint").Linter.Config} */
/**
 * Import boundaries (§1–2) + JSDoc / constants hygiene (§4) per `.cursor/rules/code-standards.mdc`.
 * - JSDoc: `warn` until the tree is cleaned up; CI still runs `lint:arch` only.
 * - Technical `esp.*` string literals: partial `no-restricted-syntax` hint; not a full substitute for review.
 */
module.exports = {
  root: true,
  extends: ["expo", "plugin:jsdoc/recommended-typescript"],
  ignorePatterns: [
    "node_modules/",
    ".expo/",
    "dist/",
    "android/",
    "ios/",
    "coverage/",
    "scripts/",
    "**/*.d.ts",
  ],
  settings: {
    jsdoc: {
      mode: "typescript",
    },
  },
  rules: {
    // --- code-standards §4 JSDoc: mandate docs on exported API; rely on TS for shapes (avoid duplicate @param types).
    "jsdoc/require-jsdoc": [
      "warn",
      {
        publicOnly: true,
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
        },
      },
    ],
    // Parameter names / arity come from TypeScript; @param tags are optional (see require-param above).
    "jsdoc/check-param-names": "off",
    "jsdoc/require-param": "off",
    "jsdoc/require-returns": "off",
    "jsdoc/require-yields": "off",
    "jsdoc/require-param-description": "warn",
    "jsdoc/require-returns-description": "off",
    "jsdoc/require-property-description": "warn",

    // --- code-standards §4 string constants: nudge for common RainMaker `esp.*` literals in comparisons (not exhaustive).
    "no-restricted-syntax": [
      "warn",
      {
        selector:
          "BinaryExpression[operator=/^(===?|!==?)$/] > Literal[value=/^esp\\./]",
        message:
          "Prefer a named constant from @shared/utils/constants or src/features/<domain>/constants.ts (code-standards §4).",
      },
    ],
  },
  overrides: [
    {
      files: [
        "src/features/**/*.{ts,tsx}",
        "app/**/*.{ts,tsx}",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@espressif/*"],
                message:
                  "Do not import Espressif SDK packages from features or app routes. Use @store / adaptors (sdk-adaptors, integrations, config) instead.",
              },
              {
                group: ["@sdk-adaptors/*"],
                message:
                  "Do not import sdk-adaptors from features or app routes. Use @store, @config, or @shared/utils/constants — code-standards §1.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/shared/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@espressif/*"],
                message:
                  "Do not import Espressif SDK packages from shared. Use @store / adaptors instead.",
              },
              {
                group: ["@features/*"],
                message:
                  "Shared code must not import feature modules. Keep shared neutral; move UI to a feature or lift shared utilities.",
              },
              {
                group: ["@sdk-adaptors/*"],
                message:
                  "Do not import sdk-adaptors from shared. Use @store, @config, or shared constants — code-standards §1.",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        "src/store/**/*.{ts,tsx}",
        "src/sdk-adaptors/**/*.{ts,tsx}",
        "src/native-adaptors/**/*.{ts,tsx}",
        "src/integrations/**/*.{ts,tsx}",
        "src/tasks/**/*.{ts,tsx}",
        "src/context/**/*.{ts,tsx}",
        "config/**/*.{ts,tsx}",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@features/*"],
                message:
                  "Infrastructure layers must not import feature modules; see code-standards §1–2.",
              },
            ],
          },
        ],
      },
    },
    // Tests and config glue: do not require product JSDoc / esp.* nudges.
    {
      files: [
        "**/*.test.{ts,tsx}",
        "**/__tests__/**/*.{ts,tsx}",
        "config/**/*.{ts,tsx}",
        "src/integrations/**/*.{ts,tsx}",
        "src/sdk-adaptors/**/*.{ts,tsx}",
        "src/native-adaptors/**/*.{ts,tsx}",
        "src/store/**/*.{ts,tsx}",
        "src/tasks/**/*.{ts,tsx}",
      ],
      rules: {
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param-description": "off",
        "jsdoc/require-property-description": "off",
        "no-restricted-syntax": "off",
      },
    },
  ],
};
