easytimer.js
============

[![NPM](https://nodei.co/npm/easytimer.js.png?downloads=true&downloadRank=true)](https://nodei.co/npm/easytimer.js/)

Easy to use Timer/Chronometer/Countdown library compatible with AMD and NodeJS

## Install

### NPM
```
npm install easytimer.js --save
````

### Bower

```
bower install easytimer.js
```

## Library Load

### Script

```html
<script src="lib/easytimer/dist/easytimer.min.js"></script>
<script>
    var timerInstance = new Timer();
</script>
```

### Node

```js
var Timer = require('easytimer.js');
var timerInstance = new Timer();
```

### AMD

```js
require(['node_modules/easytimer.js/dist/easytimer.min.js'], function (Timer) {
    var timer = new Timer();
});
```

## Examples

http://albert-gonzalez.github.io/easytimer.js/

## Basic Usage

```js
var timer = new Timer();
timer.start();
timer.addEventListener('secondsUpdated', function (e) {
    $('#basicUsage').html(timer.getTimeValues().toString());
});
```

## Timer instance API

* start(config): Start the timer
    * Parameters:
        * config (object):
            * startValues (object or array): The initial values of the timer when it is started
                * Accepted Values: Object with some of these keys: 'secondTenths', 'seconds', 'minutes', 'hours', 'days'. Or an array with this 5 positions: [secondTenths, seconds, minutes, hours, days]
                * Default Value (object or array): [0,0,0,0,0]
            * target (object or array): The target values that will make the timer to stop.
                * Accepted Values: Object with some of these keys: 'secondTenths', 'seconds', 'minutes', 'hours', 'days'. Or an array with this 5 positions: [secondTenths, seconds, minutes, hours, days]
                * Default Value: Undefined
            * precision (string): The timer update frequency.
                * Accepted Values: 'secondTenths', 'seconds', 'minutes', 'hours'
                * Default value: 'seconds'
            * callback (function): A callback function executed every time the timer is updated. The callback receives the timer as a parameter.
            * countdown (bool): If true, the timer is a countdown.
* stop(): Stop the timer
* pause(): Pause the timer
* reset(): Reset the timer values
* isRunning(): Returns true if the timer is currently running.
* addEventListener(eventType, callback): Add a listener to an event. Timer triggers events when is updated
    * Events triggered:
        * secondTenthsUpdated
        * secondsUpdated
        * minutesUpdated
        * hoursUpdated
        * daysUpdated
    * Parameters:
        * eventType (string): The type of the event that you want to listen.
        * callback (function): Function that will be executed when the timer triggers the specified event. The callback receives an object with the timer as a parameter.
* removeEventListener(eventType, callback): Remove an event listener from the timer. Same usage as addEventListener.
* getTimeValues(): Returns an object with the current values. The keys of the returned object are 'secondTenths', 'seconds', 'minutes', 'hours' and 'days'.
* getTotalTimeValues(): Returns an object with the current absolute values. The keys of the returned object are 'secondTenths', 'seconds', 'minutes', 'hours' and 'days'.

## Browser Support

Easytimer uses dispatchEvent, and this feature is available in these Browsers:

* Chrome (version >= 4)
* Firefox (version >= 2)
* IE (version >= 9)
* Opera (version >= 9)
* Safari (version >= 3)
* Mobile browsers
