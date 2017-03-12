const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const TESTS = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  // TODO: add more edge cases
];

TESTS.forEach(test => {
  defineTest(
    __dirname,
    'manual-bind-to-arrow',
    null,
    `manual-bind-to-arrow/manual-bind-to-arrow${test}`,
  );
});
