var JukeboxController = require("./controllers/ApplicationController.js").default;
var socket = io('//:3000');

var $ = require('jquery');

new JukeboxController(socket);

// ----

$(window).on('scroll', function() {
    var y_scroll_pos = window.pageYOffset;
    var scroll_pos_test = 120;             // set to whatever you want it to be

    if(y_scroll_pos > scroll_pos_test) {
        $('header').addClass('scrolled');
    }
    else {
        $('header').removeClass('scrolled');
    }
});

if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('/worker.js', {
        scope: '/'
    }).then(function (reg) {
        console.log('service worker registered', reg);
    }, function (err) {
        console.log('service worker NOT registered', err);
    });
}
