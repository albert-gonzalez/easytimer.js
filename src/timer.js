var module;

var Timer = (

    function (module) {
        'use strict';
        var SECONDS_PER_MINUTE = 60,
            MINUTES_PER_HOUR = 60,
            SECONDS_PER_HOUR = 3600,
            HOURS_PER_DAY = 24,

            SECONDS_POSITION = 0,
            MINUTES_POSITION = 1,
            HOURS_POSITION = 2,

            SECONDS = 'seconds',
            MINUTES = 'minutes',
            HOURS = 'hours',

            timerFactory = {},

            unitsLabels = [
                SECONDS,
                MINUTES,
                HOURS
            ],

            unitsInMilliseconds = {
                seconds: 1000,
                minutes: 60000,
                hours: 3600000,
            },

            events = module && module.exports? require('events') : undefined,

            prototype;

        function hasDOM() {
            return typeof document !== 'undefined';
        }

        function hasEventEmitter() {
            return events;
        }

        function mod(number, mod) {
            return ((number%mod)+mod)%mod;
        }


        function Timer() {
            var counters = {
                    seconds: 0,
                    minutes: 0,
                    hours: 0,
                },

                totalCounters = {
                    seconds: 0,
                    minutes: 0,
                    hours: 0,
                },

                timer,
                intervalId,
                eventEmitter = hasDOM()? document.createElement('span') :
                    hasEventEmitter()? new events.EventEmitter() : undefined,
                running = false,
                precision,
                valueToAdd,
                customCallback,
                timerConfig = {},
                target,
                startValues;

            function addEventListener(event, listener, useCapture) {
                if  (hasDOM()) {
                    eventEmitter.addEventListener(event, listener, useCapture);
                } else if (hasEventEmitter()) {
                    eventEmitter.on(event, listener)
                }
            }

            function removeEventListener(event, listener, useCapture) {
                if  (hasDOM()) {
                    eventEmitter.removeEventListener(event, listener, useCapture);
                } else if (hasEventEmitter()) {
                    eventEmitter.removeListener(event, listener);
                }
            }

            function dispatchEvent(event) {
                if  (hasDOM()) {
                    eventEmitter.dispatchEvent(new Event(event));
                } else if (hasEventEmitter()) {
                    eventEmitter.emit(event)
                }
            }

            function updateCounters(counter, value) {
                counters[counter] += value;
                totalCounters[counter] += value;
            }

            function updateHours(value) {
                updateCounters(HOURS, value);
                dispatchEvent('hoursUpdated');

                if (precision === HOURS) {
                    totalCounters[MINUTES] += isCountdownTimer() ? -MINUTES_PER_HOUR : MINUTES_PER_HOUR;
                    totalCounters[SECONDS] += isCountdownTimer() ? -SECONDS_PER_HOUR : SECONDS_PER_HOUR;
                }
            };

            function updateMinutes(value) {
                updateCounters(MINUTES, value);
                dispatchEvent('minutesUpdated');

                counters.minutes = mod(counters.minutes, MINUTES_PER_HOUR);
                if ((isCountdownTimer() && counters.minutes === MINUTES_PER_HOUR - 1) ||
                    (!isCountdownTimer() && counters.minutes === 0)) {
                    updateHours(value);
                }

                if (precision === MINUTES) {
                    totalCounters[SECONDS] += isCountdownTimer() ? -SECONDS_PER_MINUTE : SECONDS_PER_MINUTE;
                }
            }

            function updateSeconds(value) {
                updateCounters(SECONDS, value);
                dispatchEvent('secondsUpdated');

                counters.seconds = mod(counters.seconds, SECONDS_PER_MINUTE);
                if ((isCountdownTimer() && counters.seconds === SECONDS_PER_MINUTE - 1) ||
                    (!isCountdownTimer() && counters.seconds === 0)) {
                    updateMinutes(value);
                }
            }

            function stopTimer() {
                clearInterval(intervalId);
                intervalId = undefined;
                running = false;
            }

            function startTimer() {
                var callback,
                    interval = unitsInMilliseconds[precision];

                switch (precision) {
                    case HOURS:
                        callback = updateHours;
                        break;
                    case MINUTES:
                        callback =  updateMinutes;
                        break;
                    case SECONDS:
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
            }

            function isCountdownTimer() {
                return timerConfig.countdown
            }

            function isTargetAchieved() {
                return target instanceof Array &&
                    (timerConfig.countdown && isCountdownTimerTargetAchieved() || !timerConfig.countdown && isRegularTimerTargetAchieved());
            }

            function isRegularTimerTargetAchieved() {
                return counters.hours > target[HOURS_POSITION]
                    || (counters.hours === target[HOURS_POSITION] && (counters.minutes > target[MINUTES_POSITION]
                        || (counters.minutes === target[MINUTES_POSITION]) && counters.seconds >= target[SECONDS_POSITION]));
            }

            function isCountdownTimerTargetAchieved() {
                return counters.hours < target[HOURS_POSITION]
                    || (counters.hours === target[HOURS_POSITION] && (counters.minutes < target[MINUTES_POSITION]
                        || (counters.minutes === target[MINUTES_POSITION]) && counters.seconds <= target[SECONDS_POSITION]));
            }

            function resetCounters() {
                for (var counter in counters) {
                    if(counters.hasOwnProperty(counter)){
                        counters[counter] = 0;
                    }
                }

                for (var counter in totalCounters) {
                    if(totalCounters.hasOwnProperty(counter)){
                        totalCounters[counter] = 0;
                    }
                }
            }

            function setParams(params) {
                precision = params && typeof params.precision === 'string' ? params.precision : SECONDS;
                customCallback = params && typeof params.callback === 'function'? params.callback : function () {};
                valueToAdd = params && params.countdown === true? -1 : 1;
                if (params && (typeof params.target === 'object')) { setTarget(params.target)};
                if (params && (typeof params.startValues === 'object')) { setStartValues(params.startValues)};

                timerConfig = {
                    precision: precision,
                    callback: customCallback,
                    countdown: typeof params === 'object' && params.countdown == true,
                    target: target
                }
            }

            function configInputValues(inputValues) {
                var seconds, minutes, hours, values;
                if (typeof inputValues === 'object') {
                    if (inputValues instanceof Array) {
                        if (inputValues.length != 3) {
                            throw new Error('Array size not valid');
                        }
                        values = inputValues;
                    } else {
                        values = [inputValues.seconds || 0, inputValues.minutes || 0, inputValues.hours || 0];
                    }
                }

                seconds = values[SECONDS_POSITION];
                minutes = values[MINUTES_POSITION] + Math.floor(seconds / SECONDS_PER_MINUTE);
                hours = values[HOURS_POSITION] + Math.floor(minutes / MINUTES_PER_HOUR);

                values[SECONDS_POSITION] = seconds % SECONDS_PER_MINUTE;
                values[MINUTES_POSITION] = minutes % MINUTES_PER_HOUR;
                values[HOURS_POSITION] = hours;

                return values;
            }

            function setTarget(inputTarget) {
                target = configInputValues(inputTarget);

            }

            function setStartValues(inputStartValues) {
                startValues = configInputValues(inputStartValues);
                counters = {
                    seconds: startValues[SECONDS_POSITION],
                    minutes: startValues[MINUTES_POSITION],
                    hours: startValues[HOURS_POSITION]
                }

                totalCounters.hours = counters.hours;
                totalCounters.minutes = totalCounters.hours * MINUTES_PER_HOUR + counters.minutes;
                totalCounters.seconds = totalCounters.minutes * SECONDS_PER_MINUTE + counters.seconds;

            }

            function stop() {
                stopTimer();
                resetCounters();
                dispatchEvent('stopped');
            }

            function start(params) {
                if (this.isRunning()) {
                    throw new Error('Timer already running');
                }

                setParams(params);
                if (!isTargetAchieved()) {
                    startTimer();
                    dispatchEvent('started');
                }
            }

            function pause() {
                stopTimer();
                dispatchEvent('paused');
            }


            if (typeof this !== 'undefined') {
                this.start= start;

                this.pause = pause;

                this.stop = stop;

                this.isRunning = function () {
                    return running;
                };

                this.getTimeValues = function () {
                    return counters;
                };

                this.getSeconds = function () {
                    return counters.seconds;
                };

                this.getMinutes = function () {
                    return counters.minutes;
                };

                this.getHours = function () {
                    return counters.hours;
                };

                this.getTotalTimeValues = function () {
                    return totalCounters;
                };

                this.getTotalSeconds = function () {
                    return totalCounters.seconds;
                };

                this.getTotalMinutes = function () {
                    return totalCounters.minutes;
                };

                this.getTotalHours = function () {
                    return totalCounters.hours;
                };

                this.getConfig = function () {
                    return timerConfig;
                };

                this.addEventListener = function (event, listener, useCapture) {
                    addEventListener(event, listener, useCapture);
                };

                this.removeEventListener = function (event, listener, useCapture) {
                    removeEventListener(event, listener, useCapture);
                };
            }

        };

        if (module && module.exports) {
            module.exports = Timer;
        } else if (typeof define === 'function' && define.amd) {
            define('timer', [], function() {
                return Timer;
            });
        }

        return  Timer;
    }(module)
);
