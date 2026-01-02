import typescript from "@typescript-eslint/eslint-plugin";
import playwright from "eslint-plugin-playwright";
import typescriptParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
const { configs: typescriptConfigs } = typescript;

export default defineConfig([
  globalIgnores(["**/node_modules/", "**/playwright-report/"]),
  tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      "@playwright-eslint": typescript,
      playwright: playwright,
      prettier: prettier,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    rules: {
      ...typescriptConfigs.recommended.rules,
      ...playwright.configs["flat/recommended"].rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],

      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",

      "playwright/no-skipped-test": "warn",
      "playwright/expect-expect": "off",

      "prettier/prettier": [
        "error",
        {
          bracketSpacing: true,
          bracketSameLine: true,
          singleQuote: true,
          printWidth: 120,
          tabWidth: 2,
          useTabs: true,
          endOfLine: "auto",
          trailingComma: "es5",
        },
      ],
    },
    settings: {
      playwright: {
        globalAliases: {
          test: ["setup"],
        },
      },
    },
  },
]);
