const prettierPlugin = require('eslint-plugin-prettier')

module.exports = [
  {
    files: ['**/*.js'], // 作用于所有 JavaScript 文件
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      prettier: prettierPlugin // 使用 Prettier 插件
    },
    ignores: ['docs/fonts/**', 'docs/scripts/**', 'docs/styles/**'],
    rules: {
      'linebreak-style': ['error', 'unix'], // 强制使用 LF 行尾符号
      semi: ['error', 'never'], // 禁止分号
      quotes: ['error', 'single'], // 使用单引号
      'comma-dangle': ['error', 'never'], // 禁止对象和数组最后一个属性的逗号
      'max-len': ['error', { code: 80 }], // 最大行宽
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          trailingComma: 'none',
          printWidth: 80,
          endOfLine: 'lf' // 强制 LF 行尾符号
        }
      ]
    }
  }
]
