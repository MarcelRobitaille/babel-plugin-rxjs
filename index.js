const required = []
const observables = [
  'bindCallback',
  'bindNodeCallback',
  'combineLatest',
  'concat',
  'defer',
  'empty',
  'forkJoin',
  'from',
  'fromEvent',
  'fromEventPattern',
  'fromPromise',
  'generate',
  'if',
  'interval',
  'merge',
  'never',
  'of',
  'onErrorResumeNext',
  'pairs',
  'race',
  'range',
  'throw',
  'timer',
  'using',
  'zip',
]
const operators = [
  'audit',
  'auditTime',
  'buffer',
  'bufferCount',
  'bufferTime',
  'bufferToggle',
  'bufferWhen',
  'catch',
  'combineAll',
  'combineLatest',
  'concat',
  'concatAll',
  'concatMap',
  'concatMapTo',
  'count',
  'debounce',
  'debounceTime',
  'defaultIfEmpty',
  'delay',
  'delayWhen',
  'dematerialize',
  'distinct',
  'distinctUntilChanged',
  'distinctUntilKeyChanged',
  'do',
  'elementAt',
  'every',
  'exhaust',
  'exhaustMap',
  'expand',
  'filter',
  'finally',
  'find',
  'findIndex',
  'first',
  'groupBy',
  'ignoreElements',
  'isEmpty',
  'last',
  'let',
  'map',
  'mapTo',
  'materialize',
  'max',
  'merge',
  'mergeAll',
  'mergeMap',
  'mergeMapTo',
  'mergeScan',
  'min',
  'multicast',
  'observeOn',
  'onErrorResumeNext',
  'pairwise',
  'partition',
  'pluck',
  'publish',
  'publishBehavior',
  'publishLast',
  'publishReplay',
  'race',
  'reduce',
  'repeat',
  'repeatWhen',
  'retry',
  'retryWhen',
  'sample',
  'sampleTime',
  'scan',
  'sequenceEqual',
  'share',
  'shareReplay',
  'single',
  'skip',
  'skipLast',
  'skipUntil',
  'skipWhile',
  'startWith',
  'subscribeOn',
  'switch',
  'switchMap',
  'switchMapTo',
  'take',
  'takeLast',
  'takeUntil',
  'takeWhile',
  'throttle',
  'throttleTime',
  'timeInterval',
  'timeout',
  'timeoutWith',
  'timestamp',
  'toArray',
  'toPromise',
  'window',
  'windowCount',
  'windowTime',
  'windowToggle',
  'windowWhen',
  'withLatestFrom',
  'zip',
  'zipAll',
]

module.exports = function (babel) {
  var t = babel.types

  function addRequired (path, name) {
    if (required.indexOf(name) !== -1) return
    required.push(name)
    path.findParent(p => p.isProgram())
      .unshiftContainer('body', t.ImportDeclaration([], t.StringLiteral(name)))
  }

  function addObservable (path, name) {
    addRequired(path, 'rxjs/add/observable/' + name)
  }

  function addOperator (path, name) {
    addRequired(path, 'rxjs/add/operator/' + name)
  }

  function checkIdentifier (path, node) {
    if (!t.isIdentifier(node, { name: 'source' })) return false
    addOperator(path, path.node.name)
    return true
  }

  return {
    visitor: {
      Identifier (path) {
        if (operators.indexOf(path.node.name) === -1) return

        if (t.isMemberExpression(path.parent) && checkIdentifier(path, path.parent)) return

        var declarator = path.findParent(p => p.isVariableDeclarator())
        if (declarator && checkIdentifier(path, declarator.node.id)) return
      }
    }
  }
}

