(function (node) {
    "use strict";

    if (!node) {
        window.chess = {};
    }

    /**
     * Simple util class to normalize browser and node environments and a few
     * more perks.
     *
     * @class chess.Util
     * @static
     */
    var Util = {

        /**
         * Simple js inheritance
         *
         * @method extend
         * @for chess.Util
         *
         * @param {function} subClass
         * @param {function} superClass
         */
        extend: function (subClass, superClass) {
            var F = function () {};
            F.prototype = superClass.prototype;
            subClass.prototype = new F();
            subClass.prototype.constructor = subClass;
        },

        /**
         * Put all properties from object `b` into object `a`
         *
         * @method merge
         * @for chess.Util
         *
         * @param {object} a
         * @param {object} b
         */
        merge: function (a, b) {
            for (var p in b) {
                if (b.hasOwnProperty(p)) {
                    a[p] = b[p];
                }
            }
        },

        /**
         * Resolves a chess dependency
         *
         * @method dependency
         * @for chess.Util
         *
         * @param {string} d The dependency name
         * @return {mixed} The actual dependency
         */
        dependency: function (d) {
            return node? require("./" + d): window.chess[d];
        }

    };

    if (node) {
        module.exports = Util;
    } else {
        window.chess.Util = Util;
    }

    /**
     * Pseudo-class that represents a place structure.
     * @class chess.Place
     * @constructor
     */

    /**
     * @property r The row
     * @for chess.Place
     * @type {integer}
     */

    /**
     * @property c The column
     * @for chess.Place
     * @type {integer}
     */

    /**
     * Pseudo-class that represents a move structure.
     * @class chess.Move
     * @constructor
     */

    /**
     * @property fan
     * @for chess.Move
     * @type {string}
     */

    /**
     * @property piece
     * @for chess.Move
     * @type {chess.Piece}
     */

    /**
     * @property from
     * @for chess.Move
     * @type {chess.Place}
     */

    /**
     * @property to
     * @for chess.Move
     * @type {chess.Place}
     */

    /**
     * The move type, can be "move", "capture", "promote" or "castling"
     *
     * @property type
     * @for chess.Move
     * @type {string}
     */

}(typeof exports !== "undefined" && global.exports !== exports));
