(function (node) {
    "use strict";

    var gabarito;
    var main;

    if (node) {
        main = global;
        gabarito = require("gabarito");
    } else {
        main = window;
        gabarito = main.gabarito;
    }

    gabarito.on("complete", function () {
        gabarito.message("grunt-istanbul",
            JSON.stringify(main.__coverage__));
    });

}(typeof exports !== "undefined" && global.exports !== exports));

