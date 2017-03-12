const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const TESTS = [
  1,
  2,
  // TODO: add more edge cases
];

TESTS.forEach(test => {
  defineTest(__dirname, 'fix-eqeqeq', null, `fix-eqeqeq/fix-eqeqeq${test}`);
});
