module.exports = {
  root: true,
  env: {
    "vue/setup-compiler-macros": true,
    node: true,
  },
  extends: ["plugin:vue/vue3-essential", "@vue/typescript/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "linebreak-style": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_+$",
        varsIgnorePattern: "^_+$",
      },
    ],
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        jest: true,
      },
      rules: {
        // "vue/vue3-essential": "warn",
        // "@typescript-eslint/recommended": "warn",
        "@typescript-eslint/no-shadow": [
          "warn",
          { ignoreTypeValueShadow: true },
        ],
      },
    },
  ],
};
