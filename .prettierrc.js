'use strict';

module.exports = {
  useTabs: false,
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'none',
  bracketSameLine: false,
  semi: true,
  importOrder: [
    '^\\u0000', // Matches all side-effect imports
    '^\\./init$', // Matches './init' specifically
    '^init\\.js$', // Matches 'init.js'
    '^style\\.css$', // Matches 'style.css'
    '^\\./.*\\.css$', // Matches relative CSS imports like './style.css'
    '<THIRD_PARTY_MODULES>', // Third-party modules
    '^@(.*)/(.*)$', // Aliased imports
    '^[./]' // Relative imports
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  plugins: ['prettier-plugin-tailwindcss']
};
