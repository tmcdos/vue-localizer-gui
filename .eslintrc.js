// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/recommended', 
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    '@vue/standard'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': 'off',
    'brace-style': ['error', 'allman'],
    'object-curly-newline': ["error", {
        "ObjectExpression": { "multiline": true, "minProperties": 2, "consistent": true },
        "ObjectPattern": { "multiline": true },
        "ImportDeclaration": "never",
        "ExportDeclaration": { "multiline": true, "minProperties": 3 }
    }], 
    "object-property-newline": ["error", {"allowAllPropertiesOnSameLine": false}], 
    "comma-dangle": ["error", {
        "arrays": "only-multiline",
        "objects": "only-multiline",
        "imports": "never",
        "exports": "never",
        "functions": "never"
    }],
    'no-trailing-spaces': 'off',
    'quotes': 'off',
    'one-var': ['error', {'uninitialized': 'always', 'initialized': 'never'}],
    'no-v-html': 'off',
    "vue/max-attributes-per-line": ["error", {
      "singleline": 10,
      "multiline": {
        "max": 6,
        "allowFirstLine": true
      }
    }],
    "vue/order-in-components": ["error", 
      {
        "order": [
          "el",
          "name",
          "parent",
          "functional",
          ["delimiters", "comments"],
          ["components", "directives"],
          "extends",
          "mixins",
          "inheritAttrs",
          "model",
          ["props", "propsData"],
          "data",
          "filters",
          "computed",
          "watch",
          "LIFECYCLE_HOOKS",
          "methods",
          ["template", "render"],
          "renderError"
        ]
      }
    ],     
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/no-v-html': 'off',
  }
}
