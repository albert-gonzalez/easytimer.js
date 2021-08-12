# easytimer.js

[![NPM](https://nodei.co/npm/easytimer.js.png?downloads=true&downloadRank=true)](https://nodei.co/npm/easytimer.js/)

Easy to use Timer/Chronometer/Countdown library compatible with AMD and NodeJS

## Install

### NPM

```
npm install easytimer.js --save
```

### Bower

```
bower install easytimer.js
```

## Library Load

### Script

```html
<script src="lib/easytimer/dist/easytimer.min.js"></script>
<script>
  var timerInstance = new easytimer.Timer();
</script>
```

### Node

```js
var Timer = require("easytimer.js").Timer;
var timerInstance = new Timer();

// or

var { Timer } = require("easytimer.js");
var timerInstance = new Timer();
```

### ES6 / Typescript Imports

```js
import Timer from "easytimer.js";
const timer = new Timer();

// or

import { Timer } from "easytimer.js";
const timer = new Timer();
```

### AMD

```js
require(["node_modules/easytimer.js/dist/easytimer.min.js"], function (
  easytimer
) {
  var timer = new easytimer.Timer();
});

// or

require(["node_modules/easytimer.js/dist/easytimer.min.js"], function ({
  Timer,
}) {
  var timer = new Timer();
});
```

## Examples

http://albert-gonzalez.github.io/easytimer.js/

## Basic Usage

```js
var timer = new Timer(/* default config */);
timer.start(/* config */);
timer.addEventListener("secondsUpdated", function (e) {
  $("#basicUsage").html(timer.getTimeValues().toString());
});
```

## React

If you want to use EasyTimer with React, you can use the EasyTimer React Hook. You can check out the hook documentation here:

[EasyTimer React Hook](https://github.com/albert-gonzalez/easytimer-react-hook)

## Timer instance API

- start(config): Start the timer
  - Parameters:
    - config (object):
      - startValues (object or array): The initial values of the timer when it is started
        - Accepted Values: Object with some of these keys: 'secondTenths', 'seconds', 'minutes', 'hours', 'days'. Or an array with this 5 positions: [secondTenths, seconds, minutes, hours, days]
        - Default Value (object or array): [0,0,0,0,0]
      - target (object or array): The target values that will make the timer to stop.
        - Accepted Values: Object with some of these keys: 'secondTenths', 'seconds', 'minutes', 'hours', 'days'. Or an array with this 5 positions: [secondTenths, seconds, minutes, hours, days]
        - Default Value: Undefined
      - precision (string): The timer update frequency.
        - Accepted Values: 'secondTenths', 'seconds', 'minutes', 'hours'
        - Default value: 'seconds'
      - callback (function): A callback function executed every time the timer is updated. The callback receives the timer as a parameter.
      - countdown (bool): If true, the timer is a countdown.
  - You can pass this same config when a Timer instance is created. For example: `new Timer({ target: { seconds: 10 } })`.
    This default config will be merged with the config passed to the start function.
- stop(): Stop the timer
- pause(): Pause the timer. After pause, you can call the start method without parameters to resume the timer.
- reset(): Reset the timer values
- isRunning(): Returns true if the timer is currently running.
- isPaused(): Returns true if the timer is paused.
- addEventListener(eventType, callback): Add a listener to an event. Timer triggers events when is updated
  - Events triggered:
    - secondTenthsUpdated
    - secondsUpdated
    - minutesUpdated
    - hoursUpdated
    - daysUpdated
    - targetAchieved
    - stopped
    - reset
    - started
    - paused
  - Parameters:
    - eventType (string): The type of the event that you want to listen.
    - callback (function): Function that will be executed when the timer triggers the specified event. The callback receives an object with the timer as a parameter.
- on(eventType, callback): addEventListener alias.
- removeEventListener(eventType, callback): Removes an event listener from the timer. Same usage as addEventListener.
- off(eventType, callback): removeEventListener alias.
- removeAllEventListeners(eventType): Removes all events listeners for the given type. If no type is given it will remove all event listeners.
- getTimeValues(): Returns an object with the current values. The keys of the returned object are 'secondTenths', 'seconds', 'minutes', 'hours' and 'days'.
- getTotalTimeValues(): Returns an object with the current absolute values. The keys of the returned object are 'secondTenths', 'seconds', 'minutes', 'hours' and 'days'.
- getConfig(): Returns the configuration parameters.

## Browser Support

Easytimer uses dispatchEvent, and this feature is available in these Browsers:

- Chrome (version >= 4)
- Firefox (version >= 2)
- IE (version >= 9)
- Opera (version >= 9)
- Safari (version >= 3)
- Mobile browsers

## Known Issues

This library uses the Date class to calculate timer values. Date uses the system clock. If this clock is changed to a
different date while the timer is running the timer values will be incorrect after that. If you know a way to fix that
without losing time precision, please collaborate!
