$(function () {
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })
});

$(function () {
    var timer = new Timer();
    timer.start();
    timer.addEventListener('secondsUpdated', function (e) {
        $('#basicUsage').html(timer.getTimeValues().toString());
    });
});

$(function () {
    var timer = new Timer();
    timer.start({precision: 'seconds'});
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
    var timer = new Timer();

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
    var timer = new Timer();
    timer.start({precision: 'seconds', startValues: {seconds: 90}, target: {seconds: 120}});
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
    var timer = new Timer();
    timer.start({countdown: true, startValues: {seconds: 30}});
    $('#countdownExample .values').html(timer.getTimeValues().toString());
    timer.addEventListener('secondsUpdated', function (e) {
        $('#countdownExample .values').html(timer.getTimeValues().toString());
    });
    timer.addEventListener('targetAchieved', function (e) {
        $('#countdownExample .values').html('KABOOM!!');
    });
});

$(function () {
    var timer = new Timer();
    timer.start({callback: function (values) {
        $('#callbackExample .values').html(
            'Hello, I am a callback and I am counting time: ' + values.toString(['hours', 'minutes', 'seconds', 'secondTenths'])
        );
    }});
});

$(function () {
    var timer = new Timer();
    timer.start({precision: 'secondTenths', callback: function (values) {
        $('#secondTenthsExample').html(values.toString(['hours', 'minutes', 'seconds', 'secondTenths']));
    }});
    timer.addEventListener('secondsUpdated', function (e) {
        $('#secondTenthsExample .values').html(timer.getTimeValues().toString(['hours', 'minutes', 'seconds', 'secondTenths']));
    });
});
