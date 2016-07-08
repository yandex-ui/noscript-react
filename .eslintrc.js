module.exports = {
    extends: 'loris/es5',
    root: true,
    env: {
        browser: true,
        node: true,
        commonjs: true,
        jquery: true,
        mocha: true
    },
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    globals: {
        ns: true,
        no: true,
        React: true,
        ReactDOM: true,
        ReactDOMServer: true
    },
    rules: {
        'space-before-function-paren': [2, { anonymous: 'never', named: 'never' }],
        'object-curly-spacing': [2, 'always'],
        'dot-notation': [2, { allowKeywords: true }],
        'max-len': 0,
        camelcase: 0,
        'no-eval': 1,
        'no-implicit-coercion': [2, {
            "boolean": false,
            "number": true,
            "string": true
        }],
        'no-console': 0,
        'wrap-iife': [2, "outside"],
        'no-unused-vars': [2, { "vars": "all", "args": "none" }],
        'no-invalid-this': 0
    }
};
