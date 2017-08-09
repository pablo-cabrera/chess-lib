(function (node) {
    "use strict";

    var Util = node? require("./Util"): window.chess.Util;

    var Piece = Util.dependency("Piece");
    var Bishop = Util.dependency("Bishop");
    var Rook = Util.dependency("Rook");

    /**
     * Represents a queen within the chess game.
     *
     * @class chess.Queen
     * @extends chess.Piece
     * @constructor
     *
     * @param {boolean} white
     * @param {chess.Chess} chess
     */
    var Queen = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Queen, Piece);

    Util.merge(Queen.prototype, {

        getMoves: function () {
            return Bishop.prototype.getMoves.call(this).
                    concat(Rook.prototype.getMoves.call(this));
        },

        threatensSquare: function (r, c) {
            return Bishop.prototype.threatensSquare.call(this, r, c) ||
                    Rook.prototype.threatensSquare.call(this, r, c);
        },

        toString: function () {
            return this.white? "\u2655": "\u265B";
        }

    });

    if (node) {
        module.exports = Queen;
    } else {
        window.chess.Queen = Queen;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
