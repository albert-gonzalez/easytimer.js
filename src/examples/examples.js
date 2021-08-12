import Timer from '../easytimer/easytimer';
import $ from './jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import Prism from 'prismjs';

window.jQuery = $;
Prism.highlightAll();

$(function () {
  $('.nav-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
});

$(function () {
  const timer = new Timer();
  timer.start();
  timer.addEventListener('secondsUpdated', function (e) {
    $('#basicUsage').html(timer.getTimeValues().toString());
  });
});

$(function () {
  const timer = new Timer();
  timer.start({ precision: 'seconds' });
  timer.addEventListener('secondsUpdated', function (e) {
    $('#gettingValuesExample .days').html(timer.getTimeValues().days);
    $('#gettingValuesExample .hours').html(timer.getTimeValues().hours);
    $('#gettingValuesExample .minutes').html(timer.getTimeValues().minutes);
    $('#gettingValuesExample .seconds').html(timer.getTimeValues().seconds);
    $('#gettingValuesExample .secondTenths').html(timer.getTimeValues().secondTenths);

    $('#gettingTotalValuesExample .days').html(timer.getTotalTimeValues().days);
    $('#gettingTotalValuesExample .hours').html(timer.getTotalTimeValues().hours);
    $('#gettingTotalValuesExample .minutes').html(timer.getTotalTimeValues().minutes);
    $('#gettingTotalValuesExample .seconds').html(timer.getTotalTimeValues().seconds);
    $('#gettingTotalValuesExample .secondTenths').html(timer.getTotalTimeValues().secondTenths);
  });
});

$(function () {
  const timer = new Timer();

  $('#chronoExample .startButton').click(function () {
    timer.start();
  });

  $('#chronoExample .pauseButton').click(function () {
    timer.pause();
  });

  $('#chronoExample .stopButton').click(function () {
    timer.stop();
  });

  $('#chronoExample .resetButton').click(function () {
    timer.reset();
  });

  timer.addEventListener('secondsUpdated', function (e) {
    $('#chronoExample .values').html(timer.getTimeValues().toString());
  });

  timer.addEventListener('started', function (e) {
    $('#chronoExample .values').html(timer.getTimeValues().toString());
  });

  timer.addEventListener('reset', function (e) {
    $('#chronoExample .values').html(timer.getTimeValues().toString());
  });
});

$(function () {
  const timer = new Timer();
  timer.start({ precision: 'seconds', startValues: { seconds: 90 }, target: { seconds: 120 } });
  $('#startValuesAndTargetExample .values').html(timer.getTimeValues().toString());
  timer.addEventListener('secondsUpdated', function (e) {
    $('#startValuesAndTargetExample .values').html(timer.getTimeValues().toString());
    $('#startValuesAndTargetExample .progress_bar').html($('#startValuesAndTargetExample .progress_bar').html() + '.');
  });
  timer.addEventListener('targetAchieved', function (e) {
    $('#startValuesAndTargetExample .progress_bar').html('COMPLETE!!');
  });
});

$(function () {
  const timer = new Timer();
  timer.start({ countdown: true, startValues: { seconds: 30 } });
  $('#countdownExample .values').html(timer.getTimeValues().toString());
  timer.addEventListener('secondsUpdated', function (e) {
    $('#countdownExample .values').html(timer.getTimeValues().toString());
  });
  timer.addEventListener('targetAchieved', function (e) {
    $('#countdownExample .values').html('KABOOM!!');
  });
});

$(function () {
  const timer = new Timer();
  timer.start({
    callback: function (timer) {
      $('#callbackExample .values').html(
        'Hello, I am a callback and I am counting time: ' + timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths'])
      );
    }
  });
});

$(function () {
  const timer = new Timer();
  timer.start({ precision: 'secondTenths' });
  timer.addEventListener('secondTenthsUpdated', function (e) {
    $('#secondTenthsExample .values').html(timer.getTimeValues().toString(['hours', 'minutes', 'seconds', 'secondTenths']));
  });
});

$(function () {
  const timer = new Timer({ countdown: true, startValues: { seconds: 5 } });

  timer.start({ startValues: { seconds: 30 }, target: { seconds: 10 } });
  $('#defaultParamsExample .values').html(timer.getTimeValues().toString());
  timer.addEventListener('secondsUpdated', function (e) {
    $('#defaultParamsExample .values').html(timer.getTimeValues().toString());
  });
  timer.addEventListener('targetAchieved', function (e) {
    $('#defaultParamsExample .values').html('The bomb has been defused!');
  });
});
