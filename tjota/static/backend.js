(function () {
    'use strict';

    var ws = new WebSocket('ws://' + location.host + '/backend');

    ws.onopen = function (event) {
        console.log('on open');

        ws.send('hi');
        ws.send('bye');
    };

    ws.onmessage = function (event) {
        console.log('received: ' + event.data);
    };
})();

