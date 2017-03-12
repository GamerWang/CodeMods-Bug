/**
 * this module replaces operator '=='&'!=' with proper methods
 *
 * @date     2017-03-13
 */

/**
 * case#1(binary expression with Number-type right value):
 * if (array.length == 0) {}
 *
 * -->
 *
 * if (array.length === 0) {}
 */

/**
 * case#2(binary expression with String-type right value):
 * if ($("#user-name").val() == "" && $("#password").val() == "")
 *
 * -->
 *
 * if ($("#user-name").val() === "" && $("#password").val() === "")
 */

/**
 * case#3(binary expression judges if the left is true):
 * if (fileExists == true) {}
 *
 * -->
 *
 * if (fileExists) {}
 * -----------------------------------------------------------------------------------
 * if (fileExists != false) {}
 *
 * -->
 *
 * if (fileExists) {}
 */

/**
 * case#4(binary expression judges if the left is not true):
 * if (fileExists == false) {}
 *
 * -->
 *
 * if (!fileExists) {}
 * -----------------------------------------------------------------------------------
 * if (fileExists != true) {}
 *
 * -->
 *
 * if (!fileExists) {}
 */

/**
 * case#5(binary expression with "null" or "undefined" right-value):
 * if (obj != null && obj.a != undefined) {}
 *
 * -->
 *
 * if (obj !== null && obj !== undefined && (obj.a !== null && obj.a !== undefined))
 * -----------------------------------------------------------------------------------
 * ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
 *
 * -->
 *
 * ((expiredays === null || expiredays === undefined) ? "" : ";expires=" + exdate.toGMTString())
 */

module.exports = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // replace the BinaryExpression Node with one BinaryExpression Node
  // which has a more strict operator
  const replaceOperator = path =>
    j(path).replaceWith(
      j.binaryExpression(
        `${path.value.operator}=`,
        path.value.left,
        path.value.right,
      ),
    );

  // replace the BinaryExpression Node with its left node
  const replaceWithLeftNode = path => j(path).replaceWith(path.value.left);

  // replace the BinaryExpression Node with a UnaryExpression which is
  // made of a "!" operator and its left node
  const replaceWithUnaryExpression = path =>
    j(path).replaceWith(j.unaryExpression('!', path.value.left));

  // replace the BinaryExpression Node with a LogicalExpression which
  // has a "||" or "&&" operator and two new BinaryExpression Node as
  // its left and right node
  const replaceWithLogicalExpression = path =>
    j(path).replaceWith(
      j.logicalExpression(
        path.value.operator === '==' ? '||' : '&&',
        j.binaryExpression(
          `${path.value.operator}=`,
          path.value.left,
          j.identifier('null'),
        ),
        j.binaryExpression(
          `${path.value.operator}=`,
          path.value.left,
          j.identifier('undefined'),
        ),
      ),
    );

  // find BinaryExpression with operator '=='
  root.find(j.BinaryExpression, { operator: '==' }).forEach(path => {
    if (typeof path.node.right.value === 'number') {
      // case#1
      replaceOperator(path);
    } else if (typeof path.node.right.value === 'string') {
      // case#2
      replaceOperator(path);
    } else if (path.node.right.value === true) {
      // case#3
      replaceWithLeftNode(path);
    } else if (path.node.right.value === false) {
      // case#4
      replaceWithUnaryExpression(path);
    } else if (
      // case#5
      path.node.right.value === undefined || path.node.right.value === null
    ) {
      replaceWithLogicalExpression(path);
    }
  });

  // find BinaryExpression with operator '!='
  root.find(j.BinaryExpression, { operator: '!=' }).forEach(path => {
    if (typeof path.node.right.value === 'number') {
      // case#1
      replaceOperator(path);
    } else if (typeof path.node.right.value === 'string') {
      // case#2
      replaceOperator(path);
    } else if (path.node.right.value === true) {
      // case#4
      replaceWithUnaryExpression(path);
    } else if (path.node.right.value === false) {
      // case#3
      replaceWithLeftNode(path);
    } else if (
      // case#5
      path.node.right.value === undefined || path.node.right.value === null
    ) {
      replaceWithLogicalExpression(path);
    }
  });

  return root.toSource();
};
