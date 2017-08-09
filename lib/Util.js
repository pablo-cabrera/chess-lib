(function (node) {
    "use strict";

    if (!node) {
        window.chess = {};
    }

    var Util = {

        extend: function (subClass, superClass) {
            var F = function () {};
            F.prototype = superClass.prototype;
            subClass.prototype = new F();
            subClass.prototype.constructor = subClass;
        },

        merge: function (a, b) {
            for (var p in b) {
                if (b.hasOwnProperty(p)) {
                    a[p] = b[p];
                }
            }
        },

        dependency: function (d) {
            return node? require("./" + d): window.chess[d];
        }

    };

    if (node) {
        module.exports = Util;
    } else {
        window.chess.Util = Util;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
