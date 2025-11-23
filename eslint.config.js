/** @format */

// @ts-check

import eslintReact from "@eslint-react/eslint-plugin";
import eslintJs from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig({
	ignores: ["eslint.config.js", "node_modules"],
	extends: [
		eslintJs.configs.recommended,
		tseslint.configs.recommendedTypeChecked,
		eslintReact.configs["recommended-typescript"],
		reactYouMightNotNeedAnEffect.configs.recommended,
		reactHooks.configs.flat.recommended,
	],

	languageOptions: {
		parserOptions: {
			projectService: true,
			tsconfigRootDir: import.meta.dirname,
		},
	},

	rules: {
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
			},
		],
	},
	settings: {
		react: {
			version: "detect",
		},
	},
});
