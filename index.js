const flatten = require('./flatten.js')

const operators = require('./operators.js')
const observables = require('./observables.js')
const domObservables = require('./dom-observables.js')

const requiredOperators = []
const requiredObservables = []
const requiredDomObservables = []

module.exports = function (babel) {
  var t = babel.types


  /**
   * Add required and import to the top of the program
   *
   * @param {NodePath} path
   * @param {String} file The file to include
   */

  function addImport (path, file) {
    // Find program
    path.findParent(p => p.isProgram())
      // Add import declaration at top level
      .unshiftContainer('body', t.ImportDeclaration([], t.StringLiteral(file)))
  }


  /**
   * Add a needed operator
   *
   * @param {NodePath} path
   * @param {String} name Name of the operator
   */

  function addOperator (path, name) {
    // Push to requiredImports to save on processing if we see it again
    requiredOperators.push(name)
    // Add import declaration
    addImport(path, 'rxjs/add/operator/' + name)
  }


  /**
   * Add a needed observable constructor
   *
   * @param {NodePath} path
   * @param {String} name Name of the observable
   */

  function addObservable (path, name) {
    // Push to requiredImports to save on processing if we see it again
    requiredOperators.push(name)
    // Add import declaration
    addImport(path, 'rxjs/add/observable/' + name)
  }

  function addDomObservable (path, name) {
    // Push to requiredImports to save on processing if we see it again
    requiredOperators.push(name)
    // Add import declaration
    addImport(path, 'rxjs/add/observable/dom/' + name)
  }


  /**
   * Check if a path's leading comments define it as an observable
   *
   * @param {NodePath} path
   */

  const checkComments = path => {
    if (!path) return false

    let comments = path.node.leadingComments
    if (!comments) return false

    // Format comments
    comments = flatten(comments
      .map(comment =>
        comment.value
          // Replace out stuff we don't need
          .replace(/[*\s]/g, '')
          // Split up multiline comments
          .split('\n')
      ))

    // Check each leading comment to see if it follows the pattern '@type {Observable}'
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i].trim()
      if (comment.startsWith('@type') && comment.includes('Observable')) return true
    }
    return false
  }


  /**
   * Look for at node's callee.object until an identifier is found
   *
   * @param {CallExpression} node starting point
   * @returns {Identifier|null} most deeply nested callee.object
   */

  const getIdentifierFromCallExpression = node => {

    while (node.isCallExpression()) {
      node = node.get('callee.object')
    }

    if (t.isIdentifier(node)) return node

    return null
  }


  /**
   * Check if a CallExpression is an observable by checking it's Identifier
   *
   * @param {CallExpression} node
   * @returns {Boolean} Determines success
   */

  const checkIdentifier = path => {

    // Get what we're a method on
    const identifier = getIdentifierFromCallExpression(path)
    if (!identifier || !identifier.node) return false

    // If it's literally 'Observable.us', success!
    if (identifier.node.name === 'Observable') return true

    // >>> Otherwise, we have to determine based on scope
    const scope = path.scope.getBinding(identifier.node.name)
    // Run the same checks again on the scope's path
    if (scope !== path && isObservable(scope.path)) return true
    // <<<

    return false
  }


  /**
   * Check if path is an observable
   *
   * @param {Identifier} path
   * @returns {Boolean} Determines success
   */

  const isObservable = path => {


    /**
     * Check expressions
     */

    const expression = path.findParent(p => p.isExpressionStatement())
    if (expression) {
      if (checkComments(expression)) return true
      if (checkIdentifier(expression.get('expression'))) return true
    }


    /**
     * Check variable declarations
     */

    const declaration = path.findParent(p => p.isVariableDeclaration())
    if (declaration) {
      if (checkComments(declaration)) return true
      if (checkIdentifier(declaration.get('init'))) return true
    }
  }



  const performChecks = ({ path, list, reqList, addFn }) => {


    if (!list.includes(path.node.name)) return

    // Fail it it's already required
    if (reqList.includes(path.node.name)) return

    // If it is a method on an observable, add it
    if (isObservable(path)) return addFn(path, path.node.name)
  }

  return {
    visitor: {
      Identifier (path) {

        performChecks({ path, list: operators, reqList: requiredOperators, addFn: addOperator })
        performChecks({ path, list: observables, reqList: requiredObservables, addFn: addObservable })
        performChecks({ path, list: domObservables, reqList: requiredDomObservables, addFn: addDomObservable })

      }
    }
  }
}

