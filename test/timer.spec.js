if (typeof require !== 'undefined') {
  var assert = require('chai').assert;
  var { Timer } = require('../dist/easytimer.js');
  var sinon = require('sinon');
} else {
  window.assert = window.chai.assert;
  window.Timer = window.easytimer.Timer;
}

describe('timer.js', function () {
  this.timeout(10000);
  let timer,
    clock;

  function assertTimes (timer, timesValues, totalTimesValues) {
    const times = timer.getTimeValues();
    const totalTimes = timer.getTotalTimeValues();

    assert.deepEqual(times.secondTenths, timesValues[0]);
    assert.deepEqual(times.seconds, timesValues[1]);
    assert.deepEqual(times.minutes, timesValues[2]);
    assert.deepEqual(times.hours, timesValues[3]);
    assert.deepEqual(times.days, timesValues[4]);

    assert.deepEqual(totalTimes.secondTenths, totalTimesValues[0]);
    assert.deepEqual(totalTimes.seconds, totalTimesValues[1]);
    assert.deepEqual(totalTimes.minutes, totalTimesValues[2]);
    assert.deepEqual(totalTimes.hours, totalTimesValues[3]);
    assert.deepEqual(totalTimes.days, totalTimesValues[4]);
  }

  function assertEventTriggered (timer, event, milliseconds, timesTriggered) {
    const callback = sinon.spy();
    timer.addEventListener(event, callback);
    clock.tick(milliseconds);
    sinon.assert.callCount(callback, timesTriggered);
    assert.equal(timer, callback.args[0][0].detail.timer);
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
      let startedListener;
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

      it('should throw an exception if has an invalid value in precision parameter', () => {
        timer.stop();
        assert.throws(function () {
          timer.start({ precision: 'secons' });
        }, /Error in precision parameter: secons is not a valid value/);
      });

      describe('with timer values params passed as string', () => {
        const assertCastedValues = (timer) => {
          assertTimes(timer, [1, 2, 3, 4, 5], [4465821, 446582, 7443, 124, 5]);
          assert.deepEqual(timer.getConfig().target[0], 5);
          assert.deepEqual(timer.getConfig().target[1], 4);
          assert.deepEqual(timer.getConfig().target[2], 3);
          assert.deepEqual(timer.getConfig().target[3], 2);
          assert.deepEqual(timer.getConfig().target[4], 1);
        };

        it('should cast the string values to integer values when creating a new instance', () => {
          timer = new Timer({ startValues: ['1', '2', '3', '4', '5'], target: ['5', '4', '3', '2', '1'] });
          assertCastedValues(timer);
        });

        it('should cast the string values to integer values when starting the timer', () => {
          timer = new Timer();
          timer.start({ startValues: ['1', '2', '3', '4', '5'], target: ['5', '4', '3', '2', '1'] });
          assertCastedValues(timer);
          timer.stop();
        });
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
        });
      });
    });

    describe('started', function () {
      describe('regular timer', function () {
        describe('with tenth of seconds precision', function () {
          let params;
          beforeEach(function () {
            params = { precision: 'secondTenths', callback: sinon.spy() };
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

          it('should allow negative values and update the counter correctly', function () {
            const startValues = { seconds: -10 };
            timer.stop();
            timer.start({ startValues: startValues, precision: 'secondTenths' });

            assertEventTriggered(timer, 'secondTenthsUpdated', 1000, 10);
            assertTimes(timer, [0, 9, 0, 0, 0], [-90, -9, -0, -0, -0]);
          });
        });

        describe('with seconds precision', function () {
          let params;
          beforeEach(function () {
            params = { precision: 'seconds', callback: sinon.spy() };
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

          it('should allow negative values and update the counter correctly', function () {
            const startValues = { seconds: -10 };
            timer.stop();
            timer.start({ startValues, precision: 'seconds' });

            assertEventTriggered(timer, 'secondsUpdated', 11000, 11);
            assertTimes(timer, [0, 1, 0, 0, 0], [10, 1, 0, 0, 0]);
          });
        });

        describe('with minutes precision', function () {
          let params;
          beforeEach(function () {
            params = { precision: 'minutes', callback: sinon.spy() };
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

          it('should allow negative values and update the counter correctly', function () {
            const startValues = { minutes: -2, seconds: -35 };
            timer.stop();
            timer.start({ startValues, precision: 'minutes' });

            assertEventTriggered(timer, 'minutesUpdated', 120000, 2);
            assertTimes(timer, [0, 35, 0, 0, 0], [-350, -35, -0, -0, -0]);
          });
        });

        describe('with hours precision', function () {
          let params;
          beforeEach(function () {
            params = { precision: 'hours', callback: sinon.spy() };
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

          it('should allow negative values and update the counter correctly', function () {
            const startValues = { hours: -1, minutes: -14 };
            timer.stop();
            timer.start({ startValues, precision: 'hours' });

            assertEventTriggered(timer, 'hoursUpdated', 3600000, 1);
            assertTimes(timer, [0, 0, 14, 0, 0], [-8400, -840, -14, -0, -0]);
          });
        });
      });

      describe('countdown timer', function () {
        describe('with tenth of seconds precision', function () {
          let params;
          beforeEach(function () {
            params = { precision: 'secondTenths', callback: sinon.spy(), startValues: { seconds: 7199 }, countdown: true };
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
          let params;
          beforeEach(function () {
            params = { precision: 'seconds', callback: sinon.spy(), startValues: { seconds: 7199 }, countdown: true };
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
          let params;
          beforeEach(function () {
            params = { precision: 'minutes', callback: sinon.spy(), startValues: { seconds: 172799 }, countdown: true };
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
          let params;
          beforeEach(function () {
            params = { precision: 'hours', callback: sinon.spy(), startValues: { seconds: 172799 }, countdown: true };
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
        let target,
          configTarget;
        describe('with object input', function () {
          let emptyObjectTarget;
          beforeEach(function () {
            target = { secondTenths: 5, seconds: 10, minutes: 50, hours: 15, days: 2 };
            emptyObjectTarget = {};
          });

          it('should throw an exception if has an invalid value', () => {
            assert.throws(function () {
              timer.start({ target: { seconds: 10, minute: 5 } });
            }, /Error in startValues or target parameter: minute is not a valid input value/);
          });

          it('should transform object into array', function () {
            timer.start({ target: target });
            configTarget = timer.getConfig().target;
            assert(configTarget instanceof Array && configTarget.length === 5);
          });

          it('should transform into 0 values array if the object is empty', function () {
            timer.start({ target: emptyObjectTarget });
            configTarget = timer.getConfig().target;
            assert.equal(configTarget[0], 0);
            assert.equal(configTarget[1], 0);
            assert.equal(configTarget[2], 0);
            assert.equal(configTarget[3], 0);
            assert.equal(configTarget[4], 0);
          });

          it('should set array in this order [ts, s, m, h, d]', function () {
            timer.start({ target: target });
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
            const target = [];
            assert.throws(function () {
              timer.start({ target: target });
            }, /Array size not valid/);
          });
        });

        it('should add minutes every 60 seconds', function () {
          target = [0, 90, 0, 0, 0];
          timer.start({ target: target });
          configTarget = timer.getConfig().target;

          assert.deepEqual(timer.getConfig().target, [0, 30, 1, 0, 0]);
        });

        it('should add hours every 60 minutes', function () {
          target = [0, 0, 95, 0, 0];
          timer.start({ target: target });
          configTarget = timer.getConfig().target;

          assert.deepEqual(timer.getConfig().target, [0, 0, 35, 1, 0]);
        });

        it('should not start if start values and target are equal', function () {
          target = [0, 0, 95, 0, 0];
          const startValues = [0, 0, 95, 0, 0];
          timer.start({ target: target, startValues: startValues });
          assert(!timer.isRunning());
        });

        it('should allow negative values', function () {
          target = [0, -1, 95, -1, 0];
          timer.start({ target: target });

          assert.deepEqual(timer.getConfig().target, [0, -1, 35, 0, 0]);
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
            timer.start({ target: target, precision: 'hours' });
            assertEventTriggered(timer, 'targetAchieved', 3600000, 1);
            assert(!timer.isRunning());
          });

          it('should stop when hours counter == hours target and minutes counter > minutes target', function () {
            target = [0, 5, 5, 0, 0];
            timer.start({ target: target, precision: 'minutes' });
            assertEventTriggered(timer, 'targetAchieved', 360000, 1);
            assert(!timer.isRunning());
          });

          it('should stop when hours counter == hours target and minutes counter == minutes target and seconds counter >= seconds target', function () {
            target = [0, 5, 5, 0, 0];
            timer.start({ target: target, precision: 'seconds' });
            assertEventTriggered(timer, 'targetAchieved', 305000, 1);
            assert(!timer.isRunning());
          });

          it('should stop when target is negative and hours counter == hours target and minutes counter == minutes target and seconds counter >= seconds target', function () {
            target = [0, -1, -5, 0, 0];
            const start = [0, -2, -6, 0, 0];
            timer.start({ target: target, startValues: start, precision: 'seconds' });
            assertEventTriggered(timer, 'targetAchieved', 61000, 1);
            assert(!timer.isRunning());
          });
        });

        describe('with countdown timer', function () {
          let startValues;

          beforeEach(function () {
            clock = sinon.useFakeTimers();
          });

          afterEach(function () {
            clock.restore();
          });

          it('should stop when hours counter < hour target', function () {
            startValues = [0, 0, 30, 1, 0];
            target = [0, 0, 0, 1, 0];
            timer.start({ target: target, startValues: startValues, precision: 'hours', countdown: true });
            assertEventTriggered(timer, 'targetAchieved', 3600000, 1);
            assert(!timer.isRunning());
          });

          it('should stop when hours counter == hours target and minutes counter < minutes target', function () {
            startValues = [0, 0, 30, 0, 0];
            target = [0, 0, 29, 0, 0];
            timer.start({ target: target, startValues: startValues, precision: 'minutes', countdown: true });
            assertEventTriggered(timer, 'targetAchieved', 60000, 1);
            assert(!timer.isRunning());
          });

          it('should stop when hours counter == hours target and minutes counter == minutes target and seconds counter <= seconds target', function () {
            startValues = [0, 30, 0, 0, 0];
            target = [0, 29, 0, 0, 0];
            timer.start({ target: target, startValues: startValues, precision: 'seconds', countdown: true });
            assertEventTriggered(timer, 'targetAchieved', 1000, 1);
            assert(!timer.isRunning());
          });
        });
      });
    });

    describe('with start values', function () {
      describe('setting start values params', function () {
        let startValues,
          configStartValues;
        describe('with object input', function () {
          let emptyObjectStartValues;
          beforeEach(function () {
            startValues = { secondTenths: 5, seconds: 10, minutes: 50, hours: 15, days: 1 };
            emptyObjectStartValues = {};
          });

          it('should throw an exception if has an invalid value', () => {
            assert.throws(function () {
              timer.start({ startValues: { seconds: 10, minute: 5 } });
            }, /Error in startValues or target parameter: minute is not a valid input value/);
          });

          it('should transform object into array', function () {
            timer.start({ startValues: startValues });
            configStartValues = timer.getConfig().startValues;
            assert(configStartValues instanceof Array && configStartValues.length === 5);
          });

          it('should transform into 0 values array if the object is empty', function () {
            timer.start({ startValues: emptyObjectStartValues });
            configStartValues = timer.getConfig().startValues;
            assert.equal(configStartValues[0], 0);
            assert.equal(configStartValues[1], 0);
            assert.equal(configStartValues[2], 0);
            assert.equal(configStartValues[3], 0);
            assert.equal(configStartValues[4], 0);
          });

          it('should set seconds in first position, minutes in second position and hours in third position', function () {
            timer.start({ startValues: startValues });
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
            const startValues = [];
            assert.throws(function () {
              timer.start({ startValues: startValues });
            }, /Array size not valid/);
          });
        });

        it('should add seconds every 10 tenth of seconds', function () {
          startValues = [15, 0, 0, 0, 0];
          timer.start({ startValues: startValues });
          configStartValues = timer.getConfig().startValues;

          assert.deepEqual(timer.getConfig().startValues, [5, 1, 0, 0, 0]);
        });

        it('should add minutes every 60 seconds', function () {
          startValues = [0, 90, 0, 0, 0];
          timer.start({ startValues: startValues });
          configStartValues = timer.getConfig().startValues;

          assert.deepEqual(timer.getConfig().startValues, [0, 30, 1, 0, 0]);
        });

        it('should add hours every 60 minutes', function () {
          startValues = [0, 0, 95, 0, 0];
          timer.start({ startValues: startValues });
          configStartValues = timer.getConfig().startValues;

          assert.deepEqual(timer.getConfig().startValues, [0, 0, 35, 1, 0]);
        });

        it('should add days every 24 hours', function () {
          startValues = [0, 0, 0, 30, 0];
          timer.start({ startValues: startValues });
          configStartValues = timer.getConfig().startValues;

          assert.deepEqual(timer.getConfig().startValues, [0, 0, 0, 6, 1]);
        });

        it('should allow negative values', function () {
          startValues = [0, -1, 95, -1, 0];
          timer.start({ startValues: startValues });
          configStartValues = timer.getConfig().startValues;

          assert.deepEqual(timer.getConfig().startValues, [0, -1, 35, 0, 0]);
        });

        it('should have counters with same values that the start values', function () {
          startValues = [5, 15, 95, 0, 2];
          timer.start({ startValues: startValues });
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
          assert.isDefined(timer.getTimeValues().toString);
          assert.isDefined(timer.getTotalTimeValues().toString);
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
              '00:01:02:15:0'
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

          it('should change show days with all the digits when days >= 100', function () {
            const timerWith100days = new Timer();
            timerWith100days.start({ startValues: { days: 205, seconds: 30 } });
            assert.equal(
              timerWith100days.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']),
              '205:00:00:30:0'
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

      it('should trigger stopped event', function () {
        const callback = sinon.spy();
        timer.addEventListener('stopped', callback);
        timer.start();
        timer.stop();
        sinon.assert.callCount(callback, 1);
        assert.equal(timer, callback.args[0][0].detail.timer);
      });
    });

    describe('pause function', function () {
      let params;
      beforeEach(function () {
        params = { startValues: { seconds: 120 }, countdown: true };
        clock = sinon.useFakeTimers();
      });

      afterEach(function () {
        clock.restore();
      });

      it('should trigger paused event', function () {
        const callback = sinon.spy();
        timer.addEventListener('paused', callback);
        timer.start();
        timer.pause();
        sinon.assert.callCount(callback, 1);
        assert.equal(timer, callback.args[0][0].detail.timer);
      });

      describe('with regular timer', function () {
        it('should stop the timer', function () {
          timer.start();
          clock.tick(60000);
          timer.pause();
          assert.equal(timer.isRunning(), false);
          assertTimes(timer, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
        });

        it('should resume the timer when paused', function () {
          timer.start();
          clock.tick(60000);
          timer.pause();
          clock.tick(60000);
          timer.start();
          clock.tick(60000);
          assert.equal(timer.isRunning(), true);
          assertTimes(timer, [0, 0, 2, 0, 0], [1200, 120, 2, 0, 0]);
        });
      });

      describe('with countdown timer', function () {
        it('should stop the timer', function () {
          timer.start(params);
          clock.tick(60000);
          timer.pause();
          assert.equal(timer.isRunning(), false);
          assertTimes(timer, [0, 0, 1, 0, 0], [600, 60, 1, 0, 0]);
        });

        it('should resume the timer when paused', function () {
          timer.start(params);
          clock.tick(60000);
          timer.pause();
          clock.tick(60000);
          timer.start();
          clock.tick(30000);
          assert.equal(timer.isRunning(), true);
          assertTimes(timer, [0, 30, 0, 0, 0], [300, 30, 0, 0, 0]);
        });
      });
    });

    describe('reset function', function () {
      beforeEach(function () {
        clock = sinon.useFakeTimers();
      });

      afterEach(function () {
        clock.restore();
      });

      it('should trigger reset event', function () {
        const callback = sinon.spy();
        timer.addEventListener('reset', callback);
        timer.start();
        timer.reset();
        sinon.assert.callCount(callback, 1);
        assert.equal(timer, callback.args[0][0].detail.timer);
      });

      it('should reset the timer', function () {
        timer.start();
        clock.tick(60000);
        timer.reset();
        clock.tick(10000);
        assert.equal(timer.isRunning(), true);
        assertTimes(timer, [0, 10, 0, 0, 0], [100, 10, 0, 0, 0]);
      });

      it('should reset the timer with startValues', function () {
        timer.start({ startValues: { seconds: 60 } });
        clock.tick(60000);
        timer.reset();
        clock.tick(10000);
        assert.equal(timer.isRunning(), true);
        assertTimes(timer, [0, 10, 1, 0, 0], [700, 70, 1, 0, 0]);
      });

      it('should reset the timer when the target is achieved', function (done) {
        timer.start({ target: { seconds: 59 } });
        timer.addEventListener('targetAchieved', () => {
          timer.reset();

          clock.tick(10000);
          assert.equal(timer.isRunning(), true);
          assertTimes(timer, [0, 10, 0, 0, 0], [100, 10, 0, 0, 0]);

          done();
        });

        clock.tick(60000);
      });
    });

    describe('removeEventListener function', function () {
      let secondsUpdatedListener;
      let secondTimer;
      beforeEach(function () {
        clock = sinon.useFakeTimers();
        secondsUpdatedListener = sinon.spy();
        timer.start();
        secondTimer = new Timer();
        secondTimer.start();
      });

      afterEach(function () {
        clock.restore();
        timer.stop();
        secondTimer.stop();
      });

      it('should remove the listener from the event', function () {
        timer.addEventListener('secondsUpdated', secondsUpdatedListener);
        clock.tick(2000);
        sinon.assert.callCount(secondsUpdatedListener, 2);

        timer.removeEventListener('secondsUpdated', secondsUpdatedListener);
        clock.tick(2000);
        sinon.assert.callCount(secondsUpdatedListener, 2);

        secondTimer.addEventListener('secondsUpdated', secondsUpdatedListener);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener, 3);

        timer.addEventListener('secondsUpdated', secondsUpdatedListener);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener, 5);

        secondTimer.removeEventListener('secondsUpdated', secondsUpdatedListener);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener, 6);

        timer.removeEventListener('secondsUpdated', secondsUpdatedListener);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener, 6);
      });
    });

    describe('removeAllEventListeners function', function () {
      let secondsUpdatedListener1;
      let secondsUpdatedListener2;
      let secondTenthsUpdatedListener1;
      let secondTenthsUpdatedListener2;
      let secondTimer;
      beforeEach(function () {
        clock = sinon.useFakeTimers();
        secondsUpdatedListener1 = sinon.spy();
        secondsUpdatedListener2 = sinon.spy();
        secondTenthsUpdatedListener1 = sinon.spy();
        secondTenthsUpdatedListener2 = sinon.spy();
        timer.start();
        secondTimer = new Timer({ precision: 'secondTenths' });
        secondTimer.start();
      });

      afterEach(function () {
        clock.restore();
        timer.stop();
        secondTimer.stop();
      });

      it('should remove all the listeners from the event', function () {
        timer.addEventListener('secondsUpdated', secondsUpdatedListener1);
        clock.tick(2000);
        sinon.assert.callCount(secondsUpdatedListener1, 2);

        timer.removeAllEventListeners();
        clock.tick(2000);
        sinon.assert.callCount(secondsUpdatedListener1, 2);

        timer.addEventListener('secondsUpdated', secondsUpdatedListener1);
        timer.addEventListener('secondsUpdated', secondsUpdatedListener2);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener1, 3);
        sinon.assert.callCount(secondsUpdatedListener2, 1);

        timer.removeAllEventListeners();
        clock.tick(2000);
        sinon.assert.callCount(secondsUpdatedListener1, 3);
        sinon.assert.callCount(secondsUpdatedListener2, 1);

        timer.addEventListener('secondsUpdated', secondsUpdatedListener1);
        timer.addEventListener('secondsUpdated', secondsUpdatedListener2);
        secondTimer.addEventListener('secondsUpdated', secondsUpdatedListener2);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener1, 4);
        sinon.assert.callCount(secondsUpdatedListener2, 3);

        timer.removeAllEventListeners();
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener1, 4);
        sinon.assert.callCount(secondsUpdatedListener2, 4);
      });

      it('should remove all the listeners from the event by type and keep the rest', function () {
        secondTimer.addEventListener('secondsUpdated', secondsUpdatedListener1);
        secondTimer.addEventListener('secondTenthsUpdated', secondTenthsUpdatedListener1);
        secondTimer.addEventListener('secondTenthsUpdated', secondTenthsUpdatedListener2);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener1, 1);
        sinon.assert.callCount(secondTenthsUpdatedListener1, 10);
        sinon.assert.callCount(secondTenthsUpdatedListener2, 10);

        secondTimer.removeAllEventListeners('secondTenthsUpdated');
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener1, 2);
        sinon.assert.callCount(secondTenthsUpdatedListener1, 10);
        sinon.assert.callCount(secondTenthsUpdatedListener2, 10);

        secondTimer.addEventListener('secondTenthsUpdated', secondTenthsUpdatedListener2);
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener1, 3);
        sinon.assert.callCount(secondTenthsUpdatedListener1, 10);
        sinon.assert.callCount(secondTenthsUpdatedListener2, 20);

        secondTimer.removeAllEventListeners('secondsUpdated');
        clock.tick(1000);
        sinon.assert.callCount(secondsUpdatedListener1, 3);
        sinon.assert.callCount(secondTenthsUpdatedListener1, 10);
        sinon.assert.callCount(secondTenthsUpdatedListener2, 30);
      });
    });

    describe('on function', () => {
      it('should be an alias of addEventListener', () => {
        assert.equal(timer.addEventListener, timer.on);
      });
    });

    describe('off function', () => {
      it('should be an alias of removeEventListener', () => {
        assert.equal(timer.removeEventListener, timer.off);
      });
    });

    describe('with instance default params', () => {
      let timer, callback;

      beforeEach(() => {
        callback = () => {};
        timer = new Timer({ startValues: { seconds: 10 }, target: { seconds: 20 }, precision: 'minutes', callback });
      });

      afterEach(() => {
        timer.stop();
      });

      it('should start the timer with the default params set in the instance creation', () => {
        assert.deepEqual(timer.getConfig(), { precision: 'minutes', callback, countdown: false, target: [0, 20, 0, 0, 0], startValues: [0, 10, 0, 0, 0] });

        timer.start();
        assert.deepEqual(timer.getConfig(), { precision: 'minutes', callback, countdown: false, target: [0, 20, 0, 0, 0], startValues: [0, 10, 0, 0, 0] });
      });

      it('should merge the default params with the params set in the start function', () => {
        assert.deepEqual(timer.getConfig(), { precision: 'minutes', callback, countdown: false, target: [0, 20, 0, 0, 0], startValues: [0, 10, 0, 0, 0] });

        timer.start({ precision: 'seconds', target: { minutes: 1 }, startValues: { minutes: 1, seconds: 30 }, countdown: true });
        assert.deepEqual(timer.getConfig(), { precision: 'seconds', callback, countdown: true, target: [0, 0, 1, 0, 0], startValues: [0, 30, 1, 0, 0] });
      });

      it('should keep the default values when the timer is stopped and started again', () => {
        timer.start();
        timer.stop();
        timer.start();

        assert.deepEqual(timer.getConfig(), { precision: 'minutes', callback, countdown: false, target: [0, 20, 0, 0, 0], startValues: [0, 10, 0, 0, 0] });
      });

      it('should keep the default values when the timer is reset', () => {
        timer.start();
        timer.reset();

        assert.deepEqual(timer.getConfig(), { precision: 'minutes', callback, countdown: false, target: [0, 20, 0, 0, 0], startValues: [0, 10, 0, 0, 0] });
      });

      it('should keep the default values when the timer is paused', () => {
        timer.start();
        timer.pause();

        assert.deepEqual(timer.getConfig(), { precision: 'minutes', callback, countdown: false, target: [0, 20, 0, 0, 0], startValues: [0, 10, 0, 0, 0] });
      });

      it('should run like a timer without default params', () => {
        clock = sinon.useFakeTimers();
        const target = [0, 5, 5, 0, 0];
        timer.start({ target: target, precision: 'seconds', startValues: { seconds: 0} });
        assertEventTriggered(timer, 'targetAchieved', 305000, 1);
        assert(!timer.isRunning());
        clock.restore();
      });
    });
  });
});
