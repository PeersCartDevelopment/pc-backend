import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      react: pluginReact,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "no-unused-vars": "error",
      "camelcase": ["error", { "properties": "always" }],
      "unused-imports/no-unused-imports": "error",
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];