import prettierPlugin from 'eslint-plugin-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import vueEslintParser from 'vue-eslint-parser' // 引入 vue-eslint-parser

export default [
  // 配置适用于所有 JavaScript 文件
  {
    files: ['**/*.js'], // 作用于所有 JavaScript 文件
    languageOptions: {
      ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
      sourceType: 'module' // 设置模块类型，适用于 ES6 模块
    },
    plugins: {
      prettier: prettierPlugin // 使用 Prettier 插件
    },
    ignores: ['docs/fonts/**', 'docs/scripts/**', 'docs/styles/**'],
    rules: {
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'never'],
      'max-len': ['error', { code: 120 }],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          trailingComma: 'none',
          printWidth: 80,
          endOfLine: 'lf'
        }
      ]
    }
  },

  // 配置适用于所有 Vue 文件
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueEslintParser, // 使用 vue-eslint-parser 解析器
      parserOptions: {
        ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
        sourceType: 'module' // 设置模块类型，适用于 ES6 模块
      }
    },
    plugins: {
      vue: eslintPluginVue, // 使用 eslint-plugin-vue 插件
      prettier: prettierPlugin // 使用 Prettier 插件
    },
    rules: {
      'vue/max-len': ['error', { code: 80 }],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          trailingComma: 'none',
          printWidth: 80,
          endOfLine: 'lf',
          embeddedLanguageFormatting: 'auto'
        }
      ]
      // 其他 Vue 相关规则
    }
  }
]
