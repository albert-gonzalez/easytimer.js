# V2 to V3

The way of importing the library has changed in this v3 in order to make it compatible with ES6 and Typescript. The changes are:

## Script Load

Before:
```html
<script src="lib/easytimer/dist/easytimer.min.js"></script>
<script>
    var timerInstance = new Timer();
</script>
```
Now:
```html
<script src="lib/easytimer/dist/easytimer.min.js"></script>
<script>
    var timerInstance = new easytimer.Timer();
</script>
```

## Node

Before:
```js
var Timer = require('easytimer.js');
var timerInstance = new Timer();
```

Now:
```js
var Timer = require('easytimer.js').Timer;
var timerInstance = new Timer();

// or 

var { Timer } = require('easytimer.js');
var timerInstance = new Timer();
```

## AMD

```js
require(['node_modules/easytimer.js/dist/easytimer.min.js'], function (Timer) {
    var timer = new Timer();
});
```
Now:
```js
require(['node_modules/easytimer.js/dist/easytimer.min.js'], function (easytimer) {
    var timer = new easytimer.Timer();
});

// or

require(['node_modules/easytimer.js/dist/easytimer.min.js'], function ({ Timer }) {
    var timer = new Timer();
});
```