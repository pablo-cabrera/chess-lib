modl.

uses("/util/Util").
uses("/chess/Piece").
uses("/chess/Rook").
uses("/chess/Bishop").
unit(function (module, Util, Piece, Rook, Bishop) {
    "use strict";

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

    module.exports = Queen;
});