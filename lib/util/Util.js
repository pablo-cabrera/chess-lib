(function (node) {
    "use strict";

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
            return node?
                require(process.cwd() + "/lib/" + d):
                window.chess[d.replace(/\//g, "_")];
        }

    };

    if (node) {
        module.exports = Util;
    } else {
        window.chess.util_Util = Util;
    }

}(typeof exports !== "undefined" && global.exports !== exports));