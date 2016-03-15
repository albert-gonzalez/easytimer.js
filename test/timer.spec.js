if (typeof require !== 'undefined') {
    var assert = require('assert');
    var Timer = require('../dist/easytimer.min.js');
    var sinon = require('sinon');
}

describe('timer.js', function(){
    this.timeout(4000);
    var timer,
        clock;

    function assertTimes(timer, timesValues, totalTimesValues) {
        var times = timer.getTimeValues();
        var totalTimes = timer.getTotalTimeValues();

        assert.deepEqual(times.secondTenths, timesValues[0]);
        assert.deepEqual(times.seconds, timesValues[1]);
        assert.deepEqual(times.minutes, timesValues[2]);
        assert.deepEqual(times.hours, timesValues[3]);
        assert.deepEqual(times.days, timesValues[4]);

        assert.deepEqual(totalTimes.secondTenths, totalTimesValues[0]);
        assert.deepEqual(totalTimes.seconds, totalTimesValues[1]);
        assert.deepEqual(totalTimes.minutes, totalTimesValues[2]);
        assert.deepEqual(totalTimes.hours, totalTimesValues[3]);
        assert.deepEqual(totalTimes.days, timesValues[4]);
    }

    function assertEventTriggered(timer, event, millisecons, timesTriggered) {
        var callback = sinon.spy();
        timer.addEventListener(event, callback);
        clock.tick(millisecons);
        sinon.assert.callCount(callback, timesTriggered);
    }

    beforeEach(function () {
        timer = new Timer();
    });

    afterEach(function () {
        timer.stop();
    });

    describe('new Timer()', function () {
        it('should return a timer instance', function () {
            assert.equal(typeof timer, 'object');
            assert.equal(typeof timer.start, 'function');
        });
    });

    describe('Timer instance', function () {
        describe('default values', function () {
            it('should have counters with 0 values', function () {
                assertTimes(timer, [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]);
            });
        });

        describe('start function', function () {
            var startedListener;
            beforeEach(function () {
                startedListener = sinon.spy();
                timer.addEventListener('started', startedListener);
                timer.start();
            });

            it('should start the timer', function () {
                assert.equal(timer.isRunning(), true);
            });

            it('should trigger started event', function () {
                sinon.assert.callCount(startedListener, 1);
            });

            it('should raise and Exception if is already running', function () {
                assert.throws(function () {
                    timer.start();
                }, /Timer already running/);
            });

            describe('with default params', function () {
                it('should have seconds precision', function () {
                    assert.equal(timer.getConfig().precision, 'seconds');
                });

                it('should not be countdown timer', function () {
                    assert.equal(timer.getConfig().countdown, false);
                });

                it('should have default callback empty function', function () {
                    assert.equal(typeof timer.getConfig().callback, 'function');
                })
            });
        });

        describe('started', function () {
            describe('regular timer', function () {
                describe('with tenth of seconds precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'secondTenths', callback: sinon.spy()};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                    });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update tenth of seconds every 1 tenth of second', function () {
                        assertEventTriggered(timer, 'secondTenthsUpdated', 100, 1);
                        assertTimes(timer, [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]);
                    });

                    it('should update seconds every 1 second', function () {
                        assertEventTriggered(timer, 'secondsUpdated', 1000, 1);
                        assertTimes(timer, [0, 1, 0, 0, 0], [10, 1, 0, 0, 0]);
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                    });

                    it('should execute callback every tenth of second', function () {
                        clock.tick(100);
                        assert(params.callback.called);
                    });
                });

                describe('with seconds precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'seconds', callback: sinon.spy()};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                    });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update seconds every 1 second', function () {
                        assertEventTriggered(timer, 'secondsUpdated', 1000, 1);
                        assertTimes(timer, [0, 1, 0, 0, 0], [10, 1, 0, 0, 0]);
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                    });

                    it('should execute callback every second', function () {
                        clock.tick(1000);
                        assert(params.callback.called);
                    });
                });

                describe('with minutes precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'minutes', callback: sinon.spy()};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update minute every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                    });

                    it('should update days every 86400 seconds', function () {
                        assertEventTriggered(timer, 'daysUpdated', 86400000, 1);
                        assertTimes(timer, [0, 0, 0, 0, 1], [864000, 86400, 1440, 24, 1]);
                    });

                    it('should execute callback every 60 seconds', function () {
                        clock.tick(60000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });

                describe('with hours precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'hours', callback: sinon.spy()};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 0, 0, 1, 0], [36000, 3600, 60, 1, 0]);
                    });

                    it('should update days every 86400 seconds', function () {
                        assertEventTriggered(timer, 'daysUpdated', 86400000, 1);
                        assertTimes(timer, [0, 0, 0, 0, 1], [864000, 86400, 1440, 24, 1]);
                    });

                    it('should execute callback every 3600 seconds', function () {
                        clock.tick(3600000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });
            });

            describe('countdown timer', function () {
                describe('with tenth of seconds precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'secondTenths', callback: sinon.spy(), startValues: {seconds: 7199 }, countdown: true};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                    });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update seconds every 10 tenth of seconds', function () {
                        assertEventTriggered(timer, 'secondsUpdated', 100, 1);
                        assertTimes(timer, [9, 58, 59, 1, 0], [71989, 7198, 119, 1, 0]);
                    });

                    it('should update seconds every 1 second', function () {
                        assertEventTriggered(timer, 'secondsUpdated', 1000, 1);
                        assertTimes(timer, [0, 58, 59, 1, 0], [71980, 7198, 119, 1, 0]);
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 59, 58, 1, 0], [71390, 7139, 118, 1, 0]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 59, 59, 0, 0], [35990, 3599, 59, 0, 0]);
                    });

                    it('should execute callback every second', function () {
                        clock.tick(1000);
                        assert(params.callback.called);
                    });
                });

                describe('with seconds precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'seconds', callback: sinon.spy(), startValues: {seconds: 7199 }, countdown: true};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                    });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update seconds every 1 second', function () {
                        assertEventTriggered(timer, 'secondsUpdated', 1000, 1);
                        assertTimes(timer, [0, 58, 59, 1, 0], [71980, 7198, 119, 1, 0]);
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 59, 58, 1, 0], [71390, 7139, 118, 1, 0]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 59, 59, 0, 0], [35990, 3599, 59, 0, 0]);
                    });

                    it('should execute callback every second', function () {
                        clock.tick(1000);
                        assert(params.callback.called);
                    });
                });

                describe('with minutes precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'minutes', callback: sinon.spy(), startValues: {seconds: 172799 }, countdown: true};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update minutes every 60 seconds', function () {
                        assertEventTriggered(timer, 'minutesUpdated', 60000, 1);
                        assertTimes(timer, [0, 59, 58, 23, 1], [1727390, 172739, 2878, 47, 1]);
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 59, 59, 22, 1], [1691990, 169199, 2819, 46, 1]);
                    });

                    it('should update days every 86400 seconds', function () {
                        assertEventTriggered(timer, 'daysUpdated', 86400000, 1);
                        assertTimes(timer, [0, 59, 59, 23, 0], [863990, 86399, 1439, 23, 0]);
                    });

                    it('should execute callback every 60 seconds', function () {
                        clock.tick(60000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });

                describe('with hours precision', function () {
                    var params;
                    beforeEach(function () {
                        params = {precision: 'hours', callback: sinon.spy(), startValues: {seconds: 172799 }, countdown: true};
                        clock = sinon.useFakeTimers();
                        timer.start(params);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should update hours every 3600 seconds', function () {
                        assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
                        assertTimes(timer, [0, 59, 59, 22, 1], [1691990, 169199, 2819, 46, 1]);
                    });

                    it('should update days every 86400 seconds', function () {
                        assertEventTriggered(timer, 'daysUpdated', 86400000, 1);
                        assertTimes(timer, [0, 59, 59, 23, 0], [863990, 86399, 1439, 23, 0]);
                    });

                    it('should execute callback every 3600 seconds', function () {
                        clock.tick(3600000);
                        sinon.assert.callCount(params.callback, 1);
                    });
                });
            });
        });

        describe('with time target', function () {
            describe('setting target params', function () {
                var target,
                    configTarget;
                describe('with object input', function () {
                    var emptyObjectTarget;
                    beforeEach(function() {
                        target = {secondTenths: 5, seconds: 10, minutes: 50, hours: 15, days: 2};
                        emptyObjectTarget = {};

                    });

                    it('should transform object into array', function () {
                        timer.start({target: target});
                        configTarget = timer.getConfig().target;
                        assert(configTarget instanceof Array && configTarget.length === 5);
                    });

                    it('should transform into 0 values array if the object is empty', function () {
                        timer.start({target: emptyObjectTarget});
                        configTarget = timer.getConfig().target;
                        assert.equal(configTarget[0], 0);
                        assert.equal(configTarget[1], 0);
                        assert.equal(configTarget[2], 0);
                        assert.equal(configTarget[3], 0);
                        assert.equal(configTarget[4], 0);
                    });

                    it('should set array in this order [ts, s, m, h, d]', function () {
                        timer.start({target: target});
                        configTarget = timer.getConfig().target;
                        assert.equal(configTarget[0], target.secondTenths);
                        assert.equal(configTarget[1], target.seconds);
                        assert.equal(configTarget[2], target.minutes);
                        assert.equal(configTarget[3], target.hours);
                        assert.equal(configTarget[4], target.days);
                    });
                });

                describe('with array input', function () {
                    it('should throw exception if the size is incorrect', function () {
                        var target = [];
                        assert.throws(function () {
                            timer.start({target: target});
                        }, /Array size not valid/);
                    });
                });

                it('should add minutes every 60 seconds', function () {
                    target = [0, 90, 0, 0, 0];
                    timer.start({target: target});
                    configTarget = timer.getConfig().target;

                    assert.deepEqual(timer.getConfig().target, [0, 30, 1, 0, 0]);
                });

                it('should add hours every 60 minutes', function () {
                    target = [0, 0, 95, 0, 0];
                    timer.start({target: target});
                    configTarget = timer.getConfig().target;

                    assert.deepEqual(timer.getConfig().target, [0, 0, 35, 1, 0]);
                });

                it('should not start if start values and target are equal', function () {
                    target = [0, 0, 95, 0, 0];
                    var startValues = [0, 0, 95, 0, 0];
                    timer.start({target: target, startValues: startValues});
                    assert(!timer.isRunning());
                });

                it('should not allow negative values and set 0', function () {
                    target = [0, -1, 95, -1, 0];
                    timer.start({target: target});
                    var configStartValues = timer.getConfig().target;

                    assert.deepEqual(timer.getConfig().target, [0, 0, 35, 1, 0]);
                });

                describe('with regular timer', function () {
                    beforeEach(function () {
                        clock = sinon.useFakeTimers();
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should stop when hours counter > hour target', function () {
                        target = [0, 1, 0, 0, 0];
                        timer.start({target: target, precision: 'hours'});
                        assertEventTriggered(timer, 'targetAchieved', 3600000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter > minutes target', function () {
                        target = [0, 5, 5, 0, 0];
                        timer.start({target: target, precision: 'minutes'});
                        assertEventTriggered(timer, 'targetAchieved', 360000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter == minutes target and seconds counter >= seconds target', function () {
                        target = [0, 5, 5, 0, 0];
                        timer.start({target: target, precision: 'seconds'});
                        assertEventTriggered(timer, 'targetAchieved', 305000, 1);
                        assert(!timer.isRunning());
                    });
                });

                describe('with countdown timer', function () {
                    var startValues;

                    beforeEach(function () {
                        clock = sinon.useFakeTimers();
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should stop when hours counter < hour target', function () {
                        startValues = [0, 0, 30, 1, 0]
                        target = [0, 0, 0, 1, 0];
                        timer.start({target: target, startValues: startValues, precision: 'hours', countdown: true});
                        assertEventTriggered(timer, 'targetAchieved', 3600000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter < minutes target', function () {
                        startValues = [0, 0, 30, 0, 0];
                        target = [0, 0, 29, 0, 0];
                        timer.start({target: target, startValues: startValues, precision: 'minutes', countdown: true});
                        assertEventTriggered(timer, 'targetAchieved', 60000, 1);
                        assert(!timer.isRunning());
                    });

                    it('should stop when hours counter == hours target and minutes counter == minutes target and seconds counter <= seconds target', function () {
                        startValues = [0, 30, 0, 0, 0];
                        target = [0, 29, 0, 0, 0];
                        timer.start({target: target, startValues: startValues, precision: 'seconds', countdown: true});
                        assertEventTriggered(timer, 'targetAchieved', 1000, 1);
                        assert(!timer.isRunning());
                    });
                });
            });
        });

        describe('with start values', function () {
            describe('setting start values params', function () {
                var startValues,
                    configStartValues;
                describe('with object input', function () {
                    var emptyObjectStartValues;
                    beforeEach(function() {
                        startValues = {secondTenths: 5, seconds: 10, minutes: 50, hours: 15, days: 1};
                        emptyObjectStartValues = {};

                    });

                    it('should transform object into array', function () {
                        timer.start({startValues: startValues});
                        configStartValues = timer.getConfig().startValues;
                        assert(configStartValues instanceof Array && configStartValues.length === 5);
                    });

                    it('should transform into 0 values array if the object is empty', function () {
                        timer.start({startValues: emptyObjectStartValues});
                        configStartValues = timer.getConfig().startValues;
                        assert.equal(configStartValues[0], 0);
                        assert.equal(configStartValues[1], 0);
                        assert.equal(configStartValues[2], 0);
                        assert.equal(configStartValues[3], 0);
                        assert.equal(configStartValues[4], 0);
                    });

                    it('should set seconds in first position, minutes in second position and hours in third position', function () {
                        timer.start({startValues: startValues});
                        configStartValues = timer.getConfig().startValues;
                        assert.equal(configStartValues[0], startValues.secondTenths);
                        assert.equal(configStartValues[1], startValues.seconds);
                        assert.equal(configStartValues[2], startValues.minutes);
                        assert.equal(configStartValues[3], startValues.hours);
                        assert.equal(configStartValues[4], startValues.days);
                    });
                });

                describe('with array input', function () {
                    it('should throw exception if the size is incorrect', function () {
                        var startValues = [];
                        assert.throws(function () {
                            timer.start({startValues: startValues});
                        }, /Array size not valid/);
                    });
                });

                it('should add seconds every 10 tenth of seconds', function () {
                    startValues = [15, 0, 0, 0, 0];
                    timer.start({startValues: startValues});
                    configStartValues = timer.getConfig().startValues;

                    assert.deepEqual(timer.getConfig().startValues, [5, 1, 0, 0, 0]);
                });

                it('should add minutes every 60 seconds', function () {
                    startValues = [0, 90, 0, 0, 0];
                    timer.start({startValues: startValues});
                    configStartValues = timer.getConfig().startValues;

                    assert.deepEqual(timer.getConfig().startValues, [0, 30, 1, 0, 0]);
                });

                it('should add hours every 60 minutes', function () {
                    startValues = [0, 0, 95, 0, 0];
                    timer.start({startValues: startValues});
                    configStartValues = timer.getConfig().startValues;

                    assert.deepEqual(timer.getConfig().startValues, [0, 0, 35, 1, 0]);
                });

                it('should add days every 24 hours', function () {
                    startValues = [0, 0, 0, 30, 0];
                    timer.start({startValues: startValues});
                    configStartValues = timer.getConfig().startValues;

                    assert.deepEqual(timer.getConfig().startValues, [0, 0, 0, 6, 1]);
                });

                it('should not allow negative values and set 0', function () {
                    startValues = [0, -1, 95, -1, 0];
                    timer.start({startValues: startValues});
                    configStartValues = timer.getConfig().startValues;

                    assert.deepEqual(timer.getConfig().startValues, [0, 0, 35, 1, 0]);
                });

                it('should have counters with same values that the start values', function () {
                    startValues = [5, 15, 95, 0, 2];
                    timer.start({startValues: startValues});
                    configStartValues = timer.getConfig().startValues;

                    assert.deepEqual(timer.getTimeValues().secondTenths, 5);
                    assert.deepEqual(timer.getTimeValues().seconds, 15);
                    assert.deepEqual(timer.getTimeValues().minutes, 35);
                    assert.deepEqual(timer.getTimeValues().hours, 1);
                    assert.deepEqual(timer.getTimeValues().days, 2);
                });
            });

            describe('Time Values Counters', function () {
                it('should have toString function', function () {
                    assert(timer.getTimeValues().hasOwnProperty('toString'));
                    assert(timer.getTotalTimeValues().hasOwnProperty('toString'));
                });

                describe('toString function', function () {
                    beforeEach(function () {
                        clock = sinon.useFakeTimers();
                        timer.start();
                        clock.tick(3735000);
                     });

                    afterEach(function () {
                        clock.restore();
                    });

                    it('should work without params (default format hh:mm:ss)', function () {
                        assert.equal(timer.getTimeValues().toString(), '01:02:15');
                    });

                    it('should change the values returned with the units param', function () {
                        assert.equal(
                            timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']),
                            '00:01:02:15:00'
                        );
                    });
                    it('should change the separator with the separator param', function () {
                        assert.equal(
                            timer.getTimeValues().toString(null, ','),
                            '01,02,15'
                        );
                    });

                    it('should change the left zero padding with leftZeroPadding param', function () {
                        assert.equal(
                            timer.getTimeValues().toString(null, null, 4),
                            '0001:0002:0015'
                        );
                    });
                });
            });
        });

        describe('stop function', function () {
            beforeEach(function () {
                clock = sinon.useFakeTimers();
             });

            afterEach(function () {
                clock.restore();
            });

            it('should stop the timer and reset values', function () {
                timer.start();
                clock.tick(60000);
                timer.stop();
                assert.equal(timer.isRunning(), false);
                assertTimes(timer, [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]);
            });
        });

        describe('pause function', function () {
            beforeEach(function () {
                clock = sinon.useFakeTimers();
             });

            afterEach(function () {
                clock.restore();
            });

            it('should stop the timer', function () {
                timer.start();
                clock.tick(60000);
                timer.pause();
                assert.equal(timer.isRunning(), false);
                assertTimes(timer, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
            });
        });
    });
});
