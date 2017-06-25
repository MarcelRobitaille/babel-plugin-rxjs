# babel-plugin-rxjs
Automatically includes used methods.

```js
import { Observable } from 'rxjs/Observable'
const source = Observable.fromPromise(...).mergeMap(...)
```
becomes
```js
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/operator/mergeMap'
const source = Observable.fromPromise(...).mergeMap(...)
```

## Disclaimers:
1. This plugin is in alpha.
1. This is my first babel plugin. I have no idea what I'm doing.

For these reasons, **USE AT YOUR OWN RISK**. This plugin probably sucks.

## Usage:

### Supported patterns:
#### Observable methods:
```js
Observable.from()
Observable.of()
...
```

#### Scope:
```js
const source = Observable.from()

// Automatically detected as Observable
source.doSomething()
```

#### JSDOC @type comments:
```js
// @type {Observable}
const source = someFunctionThatReturnsAnObservable()
```

