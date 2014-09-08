(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");
    var Bishop = Util.dependency("chess/Bishop");
    var Rook = Util.dependency("chess/Rook");

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
        window.chess.chess_Queen = Queen;
    }

}(typeof exports !== "undefined" && global.exports !== exports));