modl.
uses("/util/Util").
uses("/chess/Piece").
unit(function (module, Util, Piece) {
    "use strict";

    var Knight = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Knight, Piece);

    Util.merge(Knight.prototype, {

        getMoves: function () {
            var board = this.chess.board;
            var r = this.r;
            var c = this.c;
            var w = this.white;

            var isInside = function (i) {
                return i > -1 && i < 8;
            };

            return [
                { r: r - 2, c: c - 1 },
                { r: r - 1, c: c - 2 },
                { r: r + 1, c: c - 2 },
                { r: r + 2, c: c - 1 },
                { r: r - 2, c: c + 1 },
                { r: r - 1, c: c + 2 },
                { r: r + 1, c: c + 2 },
                { r: r + 2, c: c + 1 }
            ].filter(function (m) {
                if (!isInside(m.r) || !isInside(m.c)) {
                    return false;
                }

                var p = board.pieceAt(m.r, m.c);
                return !p || p.white !== w;
            });
        },

        threatensSquare: function (r, c) {
            return Math.pow(r - this.r, 2) + Math.pow(c - this.c, 2) === 5;
        },

        toString: function () {
            return this.white? "\u2658": "\u265E";
        }
    });

    module.exports = Knight;
});