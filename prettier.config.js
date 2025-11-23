/** @format */

// @ts-check

/**
 * @format
 * @type {import("prettier").Config}
 */

const config = {
	useTabs: true,
	tabWidth: 4,
	endOfLine: "auto",
	bracketSameLine: true,
	htmlWhitespaceSensitivity: "strict",
	insertPragma: true,
	plugins: ["prettier-plugin-tailwindcss"],
	tailwindAttributes: ["classNames"],
	tailwindFunctions: ["cn"],
};

export default config;