/**
 * @license easytimer.js v1.3.2
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

            groupedUnits = {
                secondTenths: SECOND_TENTHS_PER_SECOND,
                seconds: SECONDS_PER_MINUTE,
                minutes: MINUTES_PER_HOUR,
                hours: HOURS_PER_DAY
            },

            events = module && module.exports && typeof require === 'function' ? require('events') : undefined,

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
                timerTypeFactor,
                customCallback,
                timerConfig = {},
                currentParams,
                target,
                startValues,
                countdown,
                startingDate,
                eventData = {
                    detail: {
                        timer: this
                    }
                };

            function isCountdownTimer() {
                return timerConfig.countdown;
            }

            function updateCounters(precision, value) {
                var roundedValue = Math.floor(value);

                totalCounters[precision] = roundedValue;
                counters[precision] = precision !== DAYS ?
                    mod(roundedValue, groupedUnits[precision]) : roundedValue;
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
                updateCounters(precision, value / unitsInMilliseconds[precision]);

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
                }

                startTimer();
            }

            function startTimer() {
                if (isRunning()) {
                    throw new Error('Timer already running');
                }

                if (isTargetAchieved()) {
                    return;
                }

                var interval = unitsInMilliseconds[precision];

                startingDate = roundTimestamp(Date.now()) - totalCounters.secondTenths
                    * unitsInMilliseconds[SECOND_TENTHS]
                    * timerTypeFactor;

                intervalId = setInterval(
                    updateTimerAndDispatchEvents,
                    interval
                );

                running = true;
                paused = false;
            }

            function updateTimerAndDispatchEvents() {
                var currentTime = roundTimestamp(Date.now());
                var ellapsedTime = timerTypeFactor > 0 ? (currentTime - startingDate) : (startingDate - currentTime),
                    valuesUpdated = {};

                valuesUpdated[SECOND_TENTHS] = updateSecondTenths(ellapsedTime);
                valuesUpdated[SECONDS] = updateSeconds(ellapsedTime);
                valuesUpdated[MINUTES] = updateMinutes(ellapsedTime);
                valuesUpdated[HOURS] = updateHours(ellapsedTime);
                valuesUpdated[DAYS] = updateDays(ellapsedTime);
                dispatchEvents(valuesUpdated);

                customCallback(counters);
                if (isTargetAchieved()) {
                    dispatchEvent('targetAchieved', eventData);
                    stop();
                }
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

            function isRegularTimerTargetAchieved() {
                return counters.days > target[DAYS_POSITION]
                    || (counters.days === target[DAYS_POSITION] && (counters.hours > target[HOURS_POSITION]
                    || (counters.hours === target[HOURS_POSITION] && (counters.minutes > target[MINUTES_POSITION]
                    || (counters.minutes === target[MINUTES_POSITION] && (counters.seconds >= target[SECONDS_POSITION]
                    || (counters.seconds === target[SECONDS] && counters.secondTenths >= target[SECOND_TENTHS_POSITION])))))));
            }

            function isCountdownTimerTargetAchieved() {
                return counters.days < target[DAYS_POSITION]
                    || (counters.days === target[DAYS_POSITION] && (counters.hours < target[HOURS_POSITION]
                    || (counters.hours === target[HOURS_POSITION] && (counters.minutes < target[MINUTES_POSITION]
                    || (counters.minutes === target[MINUTES_POSITION] && (counters.seconds < target[SECONDS_POSITION]
                    || (counters.seconds === target[SECONDS_POSITION] && (counters.secondTenths <= target[SECOND_TENTHS_POSITION]))))))));
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
                timerTypeFactor = params && params.countdown === true? -1 : 1;
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

                currentParams = params;
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
                stopTimerAndResetCounters()
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
            function dispatchEvent(event, data) {
                if (hasDOM()) {
                    eventEmitter.dispatchEvent(new CustomEvent(event, data));
                } else if (hasEventEmitter()) {
                    eventEmitter.emit(event, data)
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

                this.reset = reset;

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
