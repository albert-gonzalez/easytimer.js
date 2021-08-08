/**
 * @class Timer
 */

import TimeCounter from './timeCounter';
import EventEmitter from './eventEmitter';

/*
 * General functions, variables and constants
 */
const SECOND_TENTHS_PER_SECOND = 10;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const SECOND_TENTHS_POSITION = 0;
const SECONDS_POSITION = 1;
const MINUTES_POSITION = 2;
const HOURS_POSITION = 3;
const DAYS_POSITION = 4;

const SECOND_TENTHS = 'secondTenths';
const SECONDS = 'seconds';
const MINUTES = 'minutes';
const HOURS = 'hours';
const DAYS = 'days';

const VALID_INPUT_VALUES = [
  SECOND_TENTHS,
  SECONDS,
  MINUTES,
  HOURS,
  DAYS
];

const unitsInMilliseconds = {
  secondTenths: 100,
  seconds: 1000,
  minutes: 60000,
  hours: 3600000,
  days: 86400000
};

const groupedUnits = {
  secondTenths: SECOND_TENTHS_PER_SECOND,
  seconds: SECONDS_PER_MINUTE,
  minutes: MINUTES_PER_HOUR,
  hours: HOURS_PER_DAY
};

function mod (number, module) {
  return ((number % module) + module) % module;
}

/**
 * [Timer Timer/Chronometer/Countdown compatible with AMD and NodeJS.
 * Can update time values with different time intervals: tenth of seconds,
 * seconds, minutes and hours.]
 */
function Timer (defaultParams = {}) {
  /*
  * PRIVATE variables and Functions
  */
  const counters = new TimeCounter();
  let totalCounters = new TimeCounter();

  let intervalId;
  const eventEmitter = new EventEmitter();
  let running = false;
  let paused = false;
  let precision;
  let timerTypeFactor;
  let customCallback;
  let timerConfig = {};
  let currentParams;
  let targetValues;
  let startValues;
  let countdown;
  let startingDate;
  let targetDate;
  const eventData = {
    detail: {
      timer: this
    }
  };

  setParams(defaultParams);

  function updateCounters (precision, roundedValue) {
    const unitsPerGroup = groupedUnits[precision];
    totalCounters[precision] = roundedValue;

    if (precision === DAYS) {
      counters[precision] = Math.abs(roundedValue);
    } else if (roundedValue >= 0) {
      counters[precision] = mod(roundedValue, unitsPerGroup);
    } else {
      counters[precision] = mod(unitsPerGroup - mod(roundedValue, unitsPerGroup), unitsPerGroup);
    }
  }

  function updateDays (value) {
    return updateUnitByPrecision(value, DAYS);
  }

  function updateHours (value) {
    return updateUnitByPrecision(value, HOURS);
  }

  function updateMinutes (value) {
    return updateUnitByPrecision(value, MINUTES);
  }

  function updateSeconds (value) {
    return updateUnitByPrecision(value, SECONDS);
  }

  function updateSecondTenths (value) {
    return updateUnitByPrecision(value, SECOND_TENTHS);
  }

  function updateUnitByPrecision (value, precision) {
    const previousValue = totalCounters[precision];
    updateCounters(precision, calculateIntegerUnitQuotient(value, unitsInMilliseconds[precision]));

    return totalCounters[precision] !== previousValue;
  }

  function stopTimerAndResetCounters () {
    stopTimer();
    resetCounters();
  }

  function stopTimer () {
    clearInterval(intervalId);
    intervalId = undefined;
    running = false;
    paused = false;
  }

  function setParamsAndStartTimer (params) {
    if (!isPaused()) {
      setParams(params);
    } else {
      startingDate = calculateStartingDate();
      targetValues = setTarget(currentParams.target);
    }

    startTimer();
  }

  function startTimer () {
    const interval = unitsInMilliseconds[precision];

    if (isTargetAchieved(roundTimestamp(Date.now()))) {
      return;
    }

    intervalId = setInterval(
      updateTimerAndDispatchEvents,
      interval
    );

    running = true;
    paused = false;
  }

  function calculateStartingDate () {
    return roundTimestamp(Date.now()) -
      totalCounters.secondTenths * unitsInMilliseconds[SECOND_TENTHS] *
      timerTypeFactor;
  }

  function updateTimerAndDispatchEvents () {
    const currentTime = roundTimestamp(Date.now());
    const valuesUpdated = updateTimer();

    dispatchEvents(valuesUpdated);

    customCallback(eventData.detail.timer);
    if (isTargetAchieved(currentTime)) {
      stop();
      dispatchEvent('targetAchieved', eventData);
    }
  }

  function updateTimer (currentTime = roundTimestamp(Date.now())) {
    const elapsedTime = timerTypeFactor > 0 ? (currentTime - startingDate) : (startingDate - currentTime);
    const valuesUpdated = {};

    valuesUpdated[SECOND_TENTHS] = updateSecondTenths(elapsedTime);
    valuesUpdated[SECONDS] = updateSeconds(elapsedTime);
    valuesUpdated[MINUTES] = updateMinutes(elapsedTime);
    valuesUpdated[HOURS] = updateHours(elapsedTime);
    valuesUpdated[DAYS] = updateDays(elapsedTime);

    return valuesUpdated;
  }

  function roundTimestamp (timestamp) {
    return Math.floor(timestamp / unitsInMilliseconds[precision]) * unitsInMilliseconds[precision];
  }

  function dispatchEvents (valuesUpdated) {
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

  function isTargetAchieved (currentDate) {
    return targetValues instanceof Array &&
      currentDate >= targetDate;
  }

  function resetCounters () {
    counters.reset();
    totalCounters.reset();
  }

  function setParams (params) {
    params = params || {};

    precision = checkPrecision(params.precision);

    customCallback = typeof params.callback === 'function' ? params.callback : function () {};

    countdown = params.countdown === true;

    timerTypeFactor = countdown === true ? -1 : 1;

    if (typeof params.startValues === 'object') {
      setStartValues(params.startValues);
    } else {
      startValues = null;
    }

    startingDate = calculateStartingDate();

    updateTimer();

    if (typeof params.target === 'object') {
      targetValues = setTarget(params.target);
    } else if (countdown) {
      params.target = { seconds: 0 };
      targetValues = setTarget(params.target);
    } else {
      targetValues = null;
    }

    timerConfig = {
      precision: precision,
      callback: customCallback,
      countdown: typeof params === 'object' && params.countdown === true,
      target: targetValues,
      startValues: startValues
    };

    currentParams = params;
  }

  function checkPrecision (precision) {
    precision = typeof precision === 'string' ? precision : SECONDS;
    if (!isValidInputValue(precision)) {
      throw new Error(`Error in precision parameter: ${precision} is not a valid value`);
    }

    return precision;
  }

  function isValidInputValue (value) {
    return VALID_INPUT_VALUES.indexOf(value) >= 0;
  }

  function configInputValues (inputValues) {
    let values;
    if (typeof inputValues === 'object') {
      if (inputValues instanceof Array) {
        if (inputValues.length !== 5) {
          throw new Error('Array size not valid');
        }
        values = inputValues;
      } else {
        for (const value in inputValues) {
          if (VALID_INPUT_VALUES.indexOf(value) < 0) {
            throw new Error(`Error in startValues or target parameter: ${value} is not a valid input value`);
          }
        }
        values = [
          inputValues.secondTenths || 0, inputValues.seconds || 0,
          inputValues.minutes || 0, inputValues.hours || 0,
          inputValues.days || 0
        ];
      }
    }

    values = values.map((value) => parseInt(value, 10));

    const secondTenths = values[SECOND_TENTHS_POSITION];
    const seconds = values[SECONDS_POSITION] + calculateIntegerUnitQuotient(secondTenths, SECOND_TENTHS_PER_SECOND);
    const minutes = values[MINUTES_POSITION] + calculateIntegerUnitQuotient(seconds, SECONDS_PER_MINUTE);
    const hours = values[HOURS_POSITION] + calculateIntegerUnitQuotient(minutes, MINUTES_PER_HOUR);
    const days = values[DAYS_POSITION] + calculateIntegerUnitQuotient(hours, HOURS_PER_DAY);

    values[SECOND_TENTHS_POSITION] = secondTenths % SECOND_TENTHS_PER_SECOND;
    values[SECONDS_POSITION] = seconds % SECONDS_PER_MINUTE;
    values[MINUTES_POSITION] = minutes % MINUTES_PER_HOUR;
    values[HOURS_POSITION] = hours % HOURS_PER_DAY;
    values[DAYS_POSITION] = days;

    return values;
  }

  function calculateIntegerUnitQuotient (unit, divisor) {
    const quotient = unit / divisor;

    return quotient < 0 ? Math.ceil(quotient) : Math.floor(quotient);
  }

  function setTarget (inputTarget) {
    if (!inputTarget) {
      return;
    }

    targetValues = configInputValues(inputTarget);
    const targetCounter = calculateTotalCounterFromValues(targetValues);
    targetDate = startingDate +
      targetCounter.secondTenths *
      unitsInMilliseconds[SECOND_TENTHS] *
      timerTypeFactor;

    return targetValues;
  }

  function setStartValues (inputStartValues) {
    startValues = configInputValues(inputStartValues);
    counters.secondTenths = startValues[SECOND_TENTHS_POSITION];
    counters.seconds = startValues[SECONDS_POSITION];
    counters.minutes = startValues[MINUTES_POSITION];
    counters.hours = startValues[HOURS_POSITION];
    counters.days = startValues[DAYS_POSITION];

    totalCounters = calculateTotalCounterFromValues(startValues, totalCounters);
  }

  function calculateTotalCounterFromValues (values, outputCounter) {
    const total = outputCounter || {};

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
  function stop () {
    stopTimerAndResetCounters();
    dispatchEvent('stopped', eventData);
  }

  /**
   * [stop stops and starts the timer. Dispatch stopped event]
   */
  function reset () {
    stopTimerAndResetCounters();
    setParamsAndStartTimer(currentParams);
    dispatchEvent('reset', eventData);
  }

  /**
   * [start starts the timer configured by the params object. Dispatch started event]
   * @param  {object} params [Configuration parameters]
   */
  function start (params = {}) {
    params = {
      ...defaultParams,
      ...params
    };

    if (isRunning()) {
      return;
    }

    setParamsAndStartTimer(params);
    dispatchEvent('started', eventData);
  }

  /**
   * [pause stops the timer without resetting the counters. The timer it can be restarted with start function.
   * Dispatch paused event]
   * @return {type} [description]
   */
  function pause () {
    stopTimer();
    paused = true;
    dispatchEvent('paused', eventData);
  }

  /**
   * [addEventListener Adds event listener to the timer]
   * @param {string} eventType      [event to listen]
   * @param {function} listener   [the event listener function]
   */
  function addEventListener (eventType, listener) {
    eventEmitter.on(eventType, listener);
  }

  /**
   * [removeEventListener Removes event listener to the timer]
   * @param  {string} eventType    [event to remove listener]
   * @param  {function} listener [listener to remove]
   */
  function removeEventListener (eventType, listener) {
    eventEmitter.removeListener(eventType, listener);
  }

  /**
   * [removeAllEventListeners Removes all events listeners for the given type, no type to remove all types]
   * @param  {string} [eventType]  [event to remove listener]
   */
  function removeAllEventListeners (eventType) {
    eventEmitter.removeAllListeners(eventType);
  }

  /**
   * [dispatchEvent dispatches an event]
   * @param  {string} eventType [event to dispatch]
   * @param data
   */
  function dispatchEvent (eventType, data) {
    eventEmitter.emit(eventType, data);
  }

  /**
   * [isRunning return true if the timer is running]
   * @return {Boolean}
   */
  function isRunning () {
    return running;
  }

  /**
   * [isPaused returns true if the timer is paused]
   * @return {Boolean}
   */
  function isPaused () {
    return paused;
  }

  /**
   * [getTimeValues returns the counter with the current timer values]
   * @return {TimeCounter}
   */
  function getTimeValues () {
    return counters;
  }

  /**
   * [getTotalTimeValues returns the counter with the current timer total values]
   * @return {TimeCounter}
   */
  function getTotalTimeValues () {
    return totalCounters;
  }

  /**
   * [getConfig returns the configuration parameters]
   * @return {type}
   */
  function getConfig () {
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

    this.on = addEventListener;

    this.removeEventListener = removeEventListener;

    this.removeAllEventListeners = removeAllEventListeners;

    this.off = removeEventListener;
  }
}

export default Timer;

export { Timer };
