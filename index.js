// const observables = require('./observables.js')
const operators = require('./operators.js')

const requiredOperators = []

module.exports = function (babel) {
  var t = babel.types

  function addRequired (path, name) {
    path.findParent(p => p.isProgram())
      .unshiftContainer('body', t.ImportDeclaration([], t.StringLiteral(name)))
  }

  function addOperator (path, name) {
    console.log(`Adding ${name}`)
    requiredOperators.push(name)
    addRequired(path, 'rxjs/add/operator/' + name)
  }

  const checkComments = path => {
    if (!path) return false
    const comments = path.node.leadingComments
    if (!comments) return false
    console.log(comments.map(comment => comment.value))
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i].value.trim()
      if (comment.startsWith('@type') && comment.includes('Observable')) return true
    }
    return false
  }

  const getIdentifier = node => {
    if (t.isIdentifier(node)) return node

    while (node.isCallExpression()) {
      node = node.get('callee.object')
    }
    return node
  }

  const checkIdentifier = path => {
    const identifier = getIdentifier(path)
    if (!identifier || !identifier.node) return false

    if (identifier.node.name === 'Observable') return true

    const scope = path.scope.getBinding(identifier.node.name)
    if (scope && performChecks(scope.path)) return true
  }

  const performChecks = path => {

    //
    // Check expressions
    //

    const expression = path.findParent(p => p.isExpressionStatement())
    if (expression) {
      if (checkComments(expression)) return true
      if (checkIdentifier(expression.get('expression'))) return true
    }


    //
    // Check variable declarations
    //

    const declaration = path.findParent(p => p.isVariableDeclaration())
    if (declaration) {
      if (path.node.name === 'mergeMap') console.log(declaration.node)
      if (checkComments(declaration)) return true
      if (checkIdentifier(declaration.get('init'))) return true
    }
  }

  return {
    visitor: {
      Identifier (path) {

        // Fail if it's not an operator
        if (!operators.includes(path.node.name)) return

        // Fail it it's already required
        if (requiredOperators.includes(path.node.name)) return

        if (performChecks(path)) addOperator(path, path.node.name)
      }
    }
  }
}

