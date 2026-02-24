import { defineConfig } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**"],
  },
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
