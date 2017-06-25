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
1. I am too lazy to figure out if a value is an `Observable` so I basically just look for variables named `source` and check the methods.

For these reasons, **USE AT YOUR OWN RISK**. This plugin probably sucks.

