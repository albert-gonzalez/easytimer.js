/**
 * easytimer.js
 * Generated: 2018-02-18
 * Version: 2.1.0
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Timer = factory());
}(this, (function () { 'use strict';

function leftPadding(string, padLength, character) {
  var i = void 0;
  var characters = '';

  if (string.length > padLength) {
    return string;
  }

  for (i = 0; i < padLength; i = i + 1) {
    characters += String(character);
  }

  return (characters + string).slice(-characters.length);
}

function TimeCounter() {
  this.secondTenths = 0;
  this.seconds = 0;
  this.minutes = 0;
  this.hours = 0;
  this.days = 0;

  /**
   * [toString convert the counted values on a string]
   * @param  {[array]} units           [array with the units to display]
   * @param  {[string]} separator       [separator of the units]
   * @param  {[integer]} leftZeroPadding [number of zero padding]
   * @return {[string]}                 [result string]
   */
  this.toString = function (units, separator, leftZeroPadding) {
    units = units || ['hours', 'minutes', 'seconds'];
    separator = separator || ':';
    leftZeroPadding = leftZeroPadding || 2;

    var stringTime = void 0;
    var arrayTime = [];
    var i = void 0;

    for (i = 0; i < units.length; i = i + 1) {
      if (this[units[i]] !== undefined) {
        if (units[i] === 'secondTenths') {
          arrayTime.push(this[units[i]]);
        } else {
          arrayTime.push(leftPadding(this[units[i]], leftZeroPadding, '0'));
        }
      }
    }
    stringTime = arrayTime.join(separator);

    return stringTime;
  };
}

/*
* Polyfill por IE9, IE10 and IE11
*/
var CustomEvent$1 = typeof window !== 'undefined' ? window.CustomEvent : undefined;

if (typeof window !== 'undefined' && typeof CustomEvent$1 !== 'function') {
  CustomEvent$1 = function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };

  CustomEvent$1.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent$1;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * @license easytimer.js v2.0.0
 * Created by Albert González
 * Licensed under The MIT License.
 *
 * @class Timer
 */

/*
 * General functions, variables and constants
 */
var SECOND_TENTHS_PER_SECOND = 10;
var SECONDS_PER_MINUTE = 60;
var MINUTES_PER_HOUR = 60;
var HOURS_PER_DAY = 24;

var SECOND_TENTHS_POSITION = 0;
var SECONDS_POSITION = 1;
var MINUTES_POSITION = 2;
var HOURS_POSITION = 3;
var DAYS_POSITION = 4;

var SECOND_TENTHS = 'secondTenths';
var SECONDS = 'seconds';
var MINUTES = 'minutes';
var HOURS = 'hours';
var DAYS = 'days';

var unitsInMilliseconds = {
  secondTenths: 100,
  seconds: 1000,
  minutes: 60000,
  hours: 3600000,
  days: 86400000
};

var groupedUnits = {
  secondTenths: SECOND_TENTHS_PER_SECOND,
  seconds: SECONDS_PER_MINUTE,
  minutes: MINUTES_PER_HOUR,
  hours: HOURS_PER_DAY
};

var events = typeof module !== 'undefined' && module.exports && typeof require === 'function' ? require('events') : undefined;

function hasDOM() {
  return typeof document !== 'undefined';
}

function hasEventEmitter() {
  return events;
}

function mod(number, module) {
  return (number % module + module) % module;
}

/**
 * [Timer Timer/Chronometer/Countdown compatible with AMD and NodeJS.
 * Can update time values with different time intervals: tenth of seconds,
 * seconds, minutes and hours.]
 */
function Timer() {
  /*
  * PRIVATE variables and Functions
  */
  var counters = new TimeCounter();
  var totalCounters = new TimeCounter();

  var intervalId = void 0;
  var eventEmitter = hasDOM() ? document.createElement('span') : hasEventEmitter() ? new events.EventEmitter() : undefined;
  var running = false;
  var paused = false;
  var precision = void 0;
  var timerTypeFactor = void 0;
  var customCallback = void 0;
  var timerConfig = {};
  var currentParams = void 0;
  var targetValues = void 0;
  var startValues = void 0;
  var countdown = void 0;
  var startingDate = void 0;
  var targetDate = void 0;
  var eventData = {
    detail: {
      timer: this
    }
  };

  function updateCounters(precision, roundedValue) {
    totalCounters[precision] = roundedValue;

    if (precision === DAYS) {
      counters[precision] = roundedValue;
    } else if (roundedValue >= 0) {
      counters[precision] = mod(roundedValue, groupedUnits[precision]);
    } else {
      counters[precision] = groupedUnits[precision] - mod(roundedValue, groupedUnits[precision]);
    }
  }

  function updateDays(value) {
    return updateUnitByPrecision(value, DAYS);
  }

  function updateHours(value) {
    return updateUnitByPrecision(value, HOURS);
  }

  function updateMinutes(value) {
    return updateUnitByPrecision(value, MINUTES);
  }

  function updateSeconds(value) {
    return updateUnitByPrecision(value, SECONDS);
  }

  function updateSecondTenths(value) {
    return updateUnitByPrecision(value, SECOND_TENTHS);
  }

  function updateUnitByPrecision(value, precision) {
    var previousValue = totalCounters[precision];
    updateCounters(precision, calculateIntegerUnitQuotient(value, unitsInMilliseconds[precision]));

    return totalCounters[precision] !== previousValue;
  }

  function stopTimerAndResetCounters() {
    stopTimer();
    resetCounters();
  }

  function stopTimer() {
    clearInterval(intervalId);
    intervalId = undefined;
    running = false;
    paused = false;
  }

  function setParamsAndStartTimer(params) {
    if (!isPaused()) {
      setParams(params);
    } else {
      startingDate = calculateStartingDate();
      targetValues = setTarget(currentParams.target);
    }

    startTimer();
  }

  function startTimer() {
    var interval = unitsInMilliseconds[precision];

    if (isTargetAchieved(roundTimestamp(Date.now()))) {
      return;
    }

    intervalId = setInterval(updateTimerAndDispatchEvents, interval);

    running = true;
    paused = false;
  }

  function calculateStartingDate() {
    return roundTimestamp(Date.now()) - totalCounters.secondTenths * unitsInMilliseconds[SECOND_TENTHS] * timerTypeFactor;
  }

  function updateTimerAndDispatchEvents() {
    var currentTime = roundTimestamp(Date.now());
    var valuesUpdated = updateTimer();

    dispatchEvents(valuesUpdated);

    customCallback(eventData.detail.timer);
    if (isTargetAchieved(currentTime)) {
      stop();
      dispatchEvent('targetAchieved', eventData);
    }
  }

  function updateTimer() {
    var currentTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : roundTimestamp(Date.now());

    var ellapsedTime = timerTypeFactor > 0 ? currentTime - startingDate : startingDate - currentTime;
    var valuesUpdated = {};

    valuesUpdated[SECOND_TENTHS] = updateSecondTenths(ellapsedTime);
    valuesUpdated[SECONDS] = updateSeconds(ellapsedTime);
    valuesUpdated[MINUTES] = updateMinutes(ellapsedTime);
    valuesUpdated[HOURS] = updateHours(ellapsedTime);
    valuesUpdated[DAYS] = updateDays(ellapsedTime);

    return valuesUpdated;
  }

  function roundTimestamp(timestamp) {
    return Math.floor(timestamp / unitsInMilliseconds[precision]) * unitsInMilliseconds[precision];
  }

  function dispatchEvents(valuesUpdated) {
    if (valuesUpdated[SECOND_TENTHS]) {
      dispatchEvent('secondTenthsUpdated', eventData);
    }
    if (valuesUpdated[SECONDS]) {
      dispatchEvent('secondsUpdated', eventData);
    }
    if (valuesUpdated[MINUTES]) {
      dispatchEvent('minutesUpdated', eventData);
    }
    if (valuesUpdated[HOURS]) {
      dispatchEvent('hoursUpdated', eventData);
    }
    if (valuesUpdated[DAYS]) {
      dispatchEvent('daysUpdated', eventData);
    }
  }

  function isTargetAchieved(currentDate) {
    return targetValues instanceof Array && currentDate >= targetDate;
  }

  function resetCounters() {
    for (var counter in counters) {
      if (counters.hasOwnProperty(counter) && typeof counters[counter] === 'number') {
        counters[counter] = 0;
      }
    }

    for (var _counter in totalCounters) {
      if (totalCounters.hasOwnProperty(_counter) && typeof totalCounters[_counter] === 'number') {
        totalCounters[_counter] = 0;
      }
    }
  }

  function setParams(params) {
    params = params || {};

    precision = typeof params.precision === 'string' ? params.precision : SECONDS;

    customCallback = typeof params.callback === 'function' ? params.callback : function () {};

    countdown = params.countdown === true;

    timerTypeFactor = countdown === true ? -1 : 1;

    if (_typeof(params.startValues) === 'object') {
      setStartValues(params.startValues);
    }

    startingDate = calculateStartingDate();

    updateTimer();

    if (_typeof(params.target) === 'object') {
      targetValues = setTarget(params.target);
    } else if (countdown) {
      params.target = { seconds: 0 };
      targetValues = setTarget(params.target);
    }

    timerConfig = {
      precision: precision,
      callback: customCallback,
      countdown: (typeof params === 'undefined' ? 'undefined' : _typeof(params)) === 'object' && params.countdown === true,
      target: targetValues,
      startValues: startValues
    };

    currentParams = params;
  }

  function configInputValues(inputValues) {
    var secondTenths = void 0,
        seconds = void 0,
        minutes = void 0,
        hours = void 0,
        days = void 0,
        values = void 0;
    if ((typeof inputValues === 'undefined' ? 'undefined' : _typeof(inputValues)) === 'object') {
      if (inputValues instanceof Array) {
        if (inputValues.length !== 5) {
          throw new Error('Array size not valid');
        }
        values = inputValues;
      } else {
        values = [inputValues.secondTenths || 0, inputValues.seconds || 0, inputValues.minutes || 0, inputValues.hours || 0, inputValues.days || 0];
      }
    }

    secondTenths = values[SECOND_TENTHS_POSITION];
    seconds = values[SECONDS_POSITION] + calculateIntegerUnitQuotient(secondTenths, SECOND_TENTHS_PER_SECOND);
    minutes = values[MINUTES_POSITION] + calculateIntegerUnitQuotient(seconds, SECONDS_PER_MINUTE);
    hours = values[HOURS_POSITION] + calculateIntegerUnitQuotient(minutes, MINUTES_PER_HOUR);
    days = values[DAYS_POSITION] + calculateIntegerUnitQuotient(hours, HOURS_PER_DAY);

    values[SECOND_TENTHS_POSITION] = secondTenths % SECOND_TENTHS_PER_SECOND;
    values[SECONDS_POSITION] = seconds % SECONDS_PER_MINUTE;
    values[MINUTES_POSITION] = minutes % MINUTES_PER_HOUR;
    values[HOURS_POSITION] = hours % HOURS_PER_DAY;
    values[DAYS_POSITION] = days;

    return values;
  }

  function calculateIntegerUnitQuotient(unit, divisor) {
    var quotient = unit / divisor;

    return quotient < 0 ? Math.ceil(quotient) : Math.floor(quotient);
  }

  function setTarget(inputTarget) {
    if (!inputTarget) {
      return;
    }

    targetValues = configInputValues(inputTarget);
    var targetCounter = calculateTotalCounterFromFalues(targetValues);
    targetDate = startingDate + targetCounter.secondTenths * unitsInMilliseconds[SECOND_TENTHS] * timerTypeFactor;

    return targetValues;
  }

  function setStartValues(inputStartValues) {
    startValues = configInputValues(inputStartValues);
    counters.secondTenths = startValues[SECOND_TENTHS_POSITION];
    counters.seconds = startValues[SECONDS_POSITION];
    counters.minutes = startValues[MINUTES_POSITION];
    counters.hours = startValues[HOURS_POSITION];
    counters.days = startValues[DAYS_POSITION];

    totalCounters = calculateTotalCounterFromFalues(startValues, totalCounters);
  }

  function calculateTotalCounterFromFalues(values, outputCounter) {
    var total = outputCounter || {};

    total.days = values[DAYS_POSITION];
    total.hours = total.days * HOURS_PER_DAY + values[HOURS_POSITION];
    total.minutes = total.hours * MINUTES_PER_HOUR + values[MINUTES_POSITION];
    total.seconds = total.minutes * SECONDS_PER_MINUTE + values[SECONDS_POSITION];
    total.secondTenths = total.seconds * SECOND_TENTHS_PER_SECOND + values[[SECOND_TENTHS_POSITION]];

    return total;
  }

  /*
   * PUBLIC functions
   */

  /**
   * [stop stops the timer and resets the counters. Dispatch stopped event]
   */
  function stop() {
    stopTimerAndResetCounters();
    dispatchEvent('stopped', eventData);
  }

  /**
   * [stop stops and starts the timer. Dispatch stopped event]
   */
  function reset() {
    stopTimerAndResetCounters();
    setParamsAndStartTimer(currentParams);
    dispatchEvent('reset', eventData);
  }

  /**
   * [start starts the timer configured by the params object. Dispatch started event]
   * @param  {[object]} params [Configuration parameters]
   */
  function start(params) {
    if (isRunning()) {
      return;
    }

    setParamsAndStartTimer(params);
    dispatchEvent('started', eventData);
  }

  /**
   * [pause stops the timer without resetting the counters. The timer it can be restarted with start function.
   * Dispatch paused event]
   * @return {[type]} [description]
   */
  function pause() {
    stopTimer();
    paused = true;
    dispatchEvent('paused', eventData);
  }

  /**
   * [addEventListener Adds event listener to the timer]
   * @param {[string]} event      [event to listen]
   * @param {[function]} listener   [the event listener function]
   */
  function addEventListener(event, listener) {
    if (hasDOM()) {
      eventEmitter.addEventListener(event, listener);
    } else if (hasEventEmitter()) {
      eventEmitter.on(event, listener);
    }
  }

  /**
   * [removeEventListener Removes event listener to the timer]
   * @param  {[string]} event    [event to remove listener]
   * @param  {[function]} listener [listener to remove]
   */
  function removeEventListener(event, listener) {
    if (hasDOM()) {
      eventEmitter.removeEventListener(event, listener);
    } else if (hasEventEmitter()) {
      eventEmitter.removeListener(event, listener);
    }
  }

  /**
   * [dispatchEvent dispatchs an event]
   * @param  {string} event [event to dispatch]
   */
  function dispatchEvent(event, data) {
    if (hasDOM()) {
      eventEmitter.dispatchEvent(new CustomEvent(event, data));
    } else if (hasEventEmitter()) {
      eventEmitter.emit(event, data);
    }
  }

  /**
   * [isRunning return true if the timer is running]
   * @return {Boolean}
   */
  function isRunning() {
    return running;
  }

  /**
   * [isPaused returns true if the timer is paused]
   * @return {Boolean}
   */
  function isPaused() {
    return paused;
  }

  /**
   * [getTimeValues returns the counter with the current timer values]
   * @return {[TimeCounter]}
   */
  function getTimeValues() {
    return counters;
  }

  /**
   * [getTotalTimeValues returns the counter with the current timer total values]
   * @return {[TimeCounter]}
   */
  function getTotalTimeValues() {
    return totalCounters;
  }

  /**
   * [getConfig returns the configuration paramameters]
   * @return {[type]}
   */
  function getConfig() {
    return timerConfig;
  }

  /**
   * Public API
   * Definition of Timer instance public functions
   */
  if (typeof this !== 'undefined') {
    this.start = start;

    this.pause = pause;

    this.stop = stop;

    this.reset = reset;

    this.isRunning = isRunning;

    this.isPaused = isPaused;

    this.getTimeValues = getTimeValues;

    this.getTotalTimeValues = getTotalTimeValues;

    this.getConfig = getConfig;

    this.addEventListener = addEventListener;

    this.removeEventListener = removeEventListener;
  }
}

return Timer;

})));
