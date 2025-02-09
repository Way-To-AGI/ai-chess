import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    env: {
      es2021: true,
      node: true,
    },
  },
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    rules: {
      // 可以根据需要添加或修改规则
    },
  },
];

export default eslintConfig;
