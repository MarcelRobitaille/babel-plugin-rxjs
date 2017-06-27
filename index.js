const flatten = require('./flatten.js')

const operators = require('./operators.js')
const observables = require('./observables.js')
const domObservables = require('./dom-observables.js')

const types = {
  operator: operators,
  observable: observables,
  domObersvable: domObservables,
}

const required = {
  operator: [],
  observable: [],
  domObersvable: [],
}

const filePaths = {
  operator: 'operator',
  observable: 'observable',
  domObersvable: 'observabel/dom',
}

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
   * Check if a path's leading comments define it as an observable
   *
   * @param {NodePath} path
   */

  const checkComments = path => {
    if (!path || !path.node) return false

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

    while (t.isCallExpression(node)) {
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

    const callExpression = path.get('object')

    // Get what we're a method on
    const identifier = getIdentifierFromCallExpression(callExpression)
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

    const expression = path.findParent(p => p.isMemberExpression())
    if (expression) {

      // Check expression member's comments
      if (checkComments(expression)) return true

      // Check expression member's most deeply nested identifier
      if (checkIdentifier(expression)) return true
    }

    return false
  }



  const performChecks = ({ path, name }) => {

    if (!types[name].includes(path.node.name)) return

    // Fail it it's already required
    if (required[name].includes(path.node.name)) return

    // If it is a method on an observable, add it
    if (isObservable(path)) {
      required[name].push(path.node.name)
      addImport(path, `rxjs/${filePaths[name]}/${path.node.name}.js`)
    }
  }

  return {
    visitor: {
      Identifier (path) {

        performChecks({ path, name: 'operator' })
        performChecks({ path, name: 'observable' })
        performChecks({ path, name: 'domObersvable' })

      }
    }
  }
}

