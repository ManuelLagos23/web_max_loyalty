import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/app/components/pdf/TarjetaPDF.tsx"], // Adjust the path to match your file location
    rules: {
      "jsx-a11y/alt-text": "off", // Disable the alt-text rule for this file
    },
  },
];

export default eslintConfig;