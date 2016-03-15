/**
 * @license easytimer.js v1.0
 * Created by Albert González
 * Licensed under The MIT License.
 *
* @class Timer
*/

var module;

var Timer = (

    function (module) {
        'use strict';

        /*
         * Polyfill por IE9, IE10 and IE11
         */
        var CustomEvent = typeof window !== 'undefined' ? window.CustomEvent : undefined;

        if (typeof window !== 'undefined' && typeof CustomEvent !== "function" ) {
            CustomEvent = function ( event, params ) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent( 'CustomEvent' );
                evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                return evt;
            };

            CustomEvent.prototype = window.Event.prototype;

            window.CustomEvent = CustomEvent;
        }

        /*
         * General functions, variables and constants
         */
        var SECOND_TENTHS_PER_SECOND = 10,
            SECONDS_PER_MINUTE = 60,
            SECOND_TENTHS_PER_MINUTE = 600,
            MINUTES_PER_HOUR = 60,
            SECONDS_PER_HOUR = 3600,
            SECOND_TENTHS_PER_HOUR = 36000,
            HOURS_PER_DAY = 24,

            SECOND_TENTHS_POSITION = 0,
            SECONDS_POSITION = 1,
            MINUTES_POSITION = 2,
            HOURS_POSITION = 3,
            DAYS_POSITION = 4,

            SECOND_TENTHS = 'secondTenths',
            SECONDS = 'seconds',
            MINUTES = 'minutes',
            HOURS = 'hours',
            DAYS = 'days',

            unitsInMilliseconds = {
                secondTenths: 100,
                seconds: 1000,
                minutes: 60000,
                hours: 3600000,
                days: 86400000
            },

            events = module && module.exports? require('events') : undefined,

            prototype;

        function hasDOM() {
            return typeof document !== 'undefined';
        }

        function hasEventEmitter() {
            return events;
        }

        function mod(number, module) {
            return ((number % module) + module) % module;
        }

        function leftPadding(string, padLength, character) {
            var i,
                characters = '';

            for (i = 0; i < padLength; i = i + 1) {
                characters += String(character);
            }

            return (characters + string).slice(-characters.length);
        }

        /**
         * [TimeCounter Stores the units counted by the timer]
         */
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
            this.toString = function(units, separator, leftZeroPadding) {
                units = units || ['hours', 'minutes', 'seconds'];
                separator = separator || ':';
                leftZeroPadding = leftZeroPadding || 2;

                var stringTime,
                    arrayTime = [],
                    i,
                    zeros = '';

                for (i = 0; i < leftZeroPadding; i = i + 1) {
                    zeros += '0';
                }

                for (i = 0; i < units.length; i = i + 1) {
                    if (this[units[i]] !== undefined) {
                        arrayTime.push(leftPadding(this[units[i]], leftZeroPadding, '0'));
                    }
                }
                stringTime = arrayTime.join(separator);

                return stringTime;
            };
        }

        /**
         * [Timer Timer/Chronometer/Countdown compatible with AMD and NodeJS.
         * Can update time values with different time intervals: tenth of seconds,
         * seconds, minutes and hours.]
         */
        function Timer() {

            /*
             * PRIVATE Variables and Functions
             */
            var counters = new TimeCounter(),
                totalCounters =new TimeCounter(),

                intervalId,
                eventEmitter = hasDOM()? document.createElement('span') :
                    hasEventEmitter()? new events.EventEmitter() : undefined,
                running = false,
                paused = false,
                precision,
                valueToAdd,
                customCallback,
                timerConfig = {},
                target,
                startValues,
                countdown;

            function isCountdownTimer() {
                return timerConfig.countdown;
            }

            function updateCounters(counter, value) {
                counters[counter] += value;
                totalCounters[counter] += value;
            }

            function updateDays(value) {
                updateCounters(DAYS, value);

                dispatchEvent('daysUpdated');
            }

            function updateHours(value) {
                updateCounters(HOURS, value);

                counters.hours = mod(counters.hours, HOURS_PER_DAY);

                if ((isCountdownTimer() && counters.hours === HOURS_PER_DAY - 1) ||
                        (!isCountdownTimer() && counters.hours === 0)) {
                    updateDays(value);
                }

                if (precision === HOURS) {
                    totalCounters[MINUTES] += isCountdownTimer() ? -MINUTES_PER_HOUR : MINUTES_PER_HOUR;
                    totalCounters[SECONDS] += isCountdownTimer() ? -SECONDS_PER_HOUR : SECONDS_PER_HOUR;
                    totalCounters[SECOND_TENTHS] += isCountdownTimer() ? -SECOND_TENTHS_PER_HOUR : SECOND_TENTHS_PER_HOUR;
                }

                dispatchEvent('hoursUpdated');
            }

            function updateMinutes(value) {
                updateCounters(MINUTES, value);

                counters.minutes = mod(counters.minutes, MINUTES_PER_HOUR);

                if ((isCountdownTimer() && counters.minutes === MINUTES_PER_HOUR - 1) ||
                    (!isCountdownTimer() && counters.minutes === 0)) {
                    updateHours(value);
                }

                if (precision === MINUTES) {
                    totalCounters[SECONDS] += isCountdownTimer() ? -SECONDS_PER_MINUTE : SECONDS_PER_MINUTE;
                    totalCounters[SECOND_TENTHS] += isCountdownTimer() ? -SECOND_TENTHS_PER_MINUTE : SECOND_TENTHS_PER_MINUTE;
                }

                dispatchEvent('minutesUpdated');
            }

            function updateSeconds(value) {
                updateCounters(SECONDS, value);

                counters.seconds = mod(counters.seconds, SECONDS_PER_MINUTE);

                if ((isCountdownTimer() && counters.seconds === SECONDS_PER_MINUTE - 1) ||
                    (!isCountdownTimer() && counters.seconds === 0)) {
                    updateMinutes(value);
                }

                if (precision === SECONDS) {
                    totalCounters[SECOND_TENTHS] += isCountdownTimer() ? -SECOND_TENTHS_PER_SECOND : SECOND_TENTHS_PER_SECOND;
                }

                dispatchEvent('secondsUpdated');
            }

            function updateSecondTenths(value) {
                updateCounters(SECOND_TENTHS, value);

                counters.secondTenths = mod(counters.secondTenths, SECOND_TENTHS_PER_SECOND);

                if ((isCountdownTimer() && counters.secondTenths === SECOND_TENTHS_PER_SECOND - 1) ||
                    (!isCountdownTimer() && counters.secondTenths === 0)) {
                    updateSeconds(value);
                }

                dispatchEvent('secondTenthsUpdated');
            }

            function stopTimer() {
                clearInterval(intervalId);
                intervalId = undefined;
                running = false;
                paused = false;
            }

            function startTimer() {
                var callback,
                    interval = unitsInMilliseconds[precision];

                switch (precision) {
                case DAYS:
                    callback = updateDays;
                    break;
                case HOURS:
                    callback = updateHours;
                    break;
                case MINUTES:
                    callback =  updateMinutes;
                    break;
                case SECOND_TENTHS:
                    callback =  updateSecondTenths;
                    break;
                default:
                    callback = updateSeconds;
                }

                intervalId = setInterval(
                    function () {
                        callback(valueToAdd);
                        customCallback(counters);
                        if (isTargetAchieved()) {
                            dispatchEvent('targetAchieved');
                            stop();
                        }
                    },
                    interval
                );

                running = true;
                paused = false;
            }

            function isRegularTimerTargetAchieved() {
                return counters.hours > target[HOURS_POSITION]
                    || (counters.hours === target[HOURS_POSITION] && (counters.minutes > target[MINUTES_POSITION]
                        || (counters.minutes === target[MINUTES_POSITION]) && counters.seconds >= target[SECONDS_POSITION]));
            }

            function isCountdownTimerTargetAchieved() {
                return counters.hours < target[HOURS_POSITION]
                    || (counters.hours === target[HOURS_POSITION] && (counters.minutes < target[MINUTES_POSITION]
                    || (counters.minutes === target[MINUTES_POSITION] && (counters.seconds < target[SECONDS_POSITION]
                    || (counters.seconds === target[SECONDS_POSITION] && (counters.secondTenths < target[SECOND_TENTHS_POSITION]
                    || counters.secondTenths === target[SECOND_TENTHS_POSITION] ))))));
            }

            function isTargetAchieved() {
                return target instanceof Array &&
                    (timerConfig.countdown && isCountdownTimerTargetAchieved() || !timerConfig.countdown && isRegularTimerTargetAchieved());
            }

            function resetCounters() {
                for (var counter in counters) {
                    if(counters.hasOwnProperty(counter) && typeof counters[counter] === 'number'){
                        counters[counter] = 0;
                    }
                }

                for (var counter in totalCounters) {
                    if(totalCounters.hasOwnProperty(counter) && typeof totalCounters[counter] === 'number'){
                        totalCounters[counter] = 0;
                    }
                }
            }

            function setParams(params) {
                precision = params && typeof params.precision === 'string' ? params.precision : SECONDS;
                customCallback = params && typeof params.callback === 'function'? params.callback : function () {};
                valueToAdd = params && params.countdown === true? -1 : 1;
                countdown = params && params.countdown == true;
                if (params && (typeof params.target === 'object')) { setTarget(params.target)};
                if (params && (typeof params.startValues === 'object')) { setStartValues(params.startValues)};
                target = target || !countdown? target : [0, 0, 0, 0, 0];

                timerConfig = {
                    precision: precision,
                    callback: customCallback,
                    countdown: typeof params === 'object' && params.countdown == true,
                    target: target,
                    startValues: startValues
                }
            }

            function configInputValues(inputValues) {
                var secondTenths, seconds, minutes, hours, days, values;
                if (typeof inputValues === 'object') {
                    if (inputValues instanceof Array) {
                        if (inputValues.length != 5) {
                            throw new Error('Array size not valid');
                        }
                        values = inputValues;
                    } else {
                        values = [
                            inputValues.secondTenths || 0, inputValues.seconds || 0,
                            inputValues.minutes || 0, inputValues.hours || 0,
                            inputValues.days || 0
                        ];
                    }
                }

                for (var i = 0; i < inputValues.length; i = i + 1) {
                    if (inputValues[i] < 0) {
                        inputValues[i] = 0;
                    }
                }

                secondTenths = values[SECOND_TENTHS_POSITION];
                seconds = values[SECONDS_POSITION] + Math.floor(secondTenths / SECOND_TENTHS_PER_SECOND);
                minutes = values[MINUTES_POSITION] + Math.floor(seconds / SECONDS_PER_MINUTE);
                hours = values[HOURS_POSITION] + Math.floor(minutes / MINUTES_PER_HOUR);
                days = values[DAYS_POSITION] +  Math.floor(hours / HOURS_PER_DAY);

                values[SECOND_TENTHS_POSITION] = secondTenths % SECOND_TENTHS_PER_SECOND;
                values[SECONDS_POSITION] = seconds % SECONDS_PER_MINUTE;
                values[MINUTES_POSITION] = minutes % MINUTES_PER_HOUR;
                values[HOURS_POSITION] = hours % HOURS_PER_DAY;
                values[DAYS_POSITION] = days;

                return values;
            }

            function setTarget(inputTarget) {
                target = configInputValues(inputTarget);

            }

            function setStartValues(inputStartValues) {
                startValues = configInputValues(inputStartValues);
                counters.secondTenths = startValues[SECOND_TENTHS_POSITION];
                counters.seconds = startValues[SECONDS_POSITION];
                counters.minutes = startValues[MINUTES_POSITION];
                counters.hours = startValues[HOURS_POSITION]
                counters.days = startValues[DAYS_POSITION]

                totalCounters.days = counters.days;
                totalCounters.hours = totalCounters.days * HOURS_PER_DAY + counters.hours;
                totalCounters.minutes = totalCounters.hours * MINUTES_PER_HOUR + counters.minutes;
                totalCounters.seconds = totalCounters.minutes * SECONDS_PER_MINUTE + counters.seconds;
                totalCounters.secondTenths = totalCounters.seconds * SECOND_TENTHS_PER_SECOND + counters.secondTenths;
            }

            /*
             * PUBLIC functions
             */

            /**
             * [stop stops the timer and resets the counters. Dispatch stopped event]
             */
            function stop() {
                stopTimer();
                resetCounters();
                dispatchEvent('stopped');
            }

            /**
             * [start starts the timer configured by the params object. Dispatch started event]
             * @param  {[object]} params [Configuration parameters]
             */
            function start(params) {
                if (this.isRunning()) {
                    throw new Error('Timer already running');
                }

                if (!this.isPaused()) {
                    setParams(params);
                }
                if (!isTargetAchieved()) {
                    startTimer();
                    dispatchEvent('started');
                }
            }

            /**
             * [pause stops the timer without resetting the counters. The timer it can be restarted with start function.
             * Dispatch paused event]
             * @return {[type]} [description]
             */
            function pause() {
                stopTimer();
                paused = true;
                dispatchEvent('paused');
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
                    eventEmitter.on(event, listener)
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
            function dispatchEvent(event) {
                if (hasDOM()) {
                    eventEmitter.dispatchEvent(new CustomEvent(event));
                } else if (hasEventEmitter()) {
                    eventEmitter.emit(event)
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
            };

            /**
             * [getTotalTimeValues returns the counter with the current timer total values]
             * @return {[TimeCounter]}
             */
            function getTotalTimeValues() {
                return totalCounters;
            };

            /**
             * [getConfig returns the configuration paramameters]
             * @return {[type]}
             */
            function getConfig () {
                return timerConfig;
            };

            /**
             * Public API
             * Definition of Timer instance public functions
             */
            if (typeof this !== 'undefined') {
                this.start= start;

                this.pause = pause;

                this.stop = stop;

                this.isRunning = isRunning;

                this.isPaused = isPaused;

                this.getTimeValues = getTimeValues;

                this.getTotalTimeValues = getTotalTimeValues;

                this.getConfig = getConfig;

                this.addEventListener = addEventListener

                this.removeEventListener = removeEventListener;
            }

        };

        if (module && module.exports) {
            module.exports = Timer;
        } else if (typeof define === 'function' && define.amd) {
            define([], function() {
                return Timer;
            });
        }

        return  Timer;
    }(module)
);
