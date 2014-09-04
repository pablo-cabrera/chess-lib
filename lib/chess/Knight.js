(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

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
            var ir = r < this.r? 1: -1,
                ic = c < this.c? 1: -1;

            return r + ir === this.r && c + 2 * ic === this.c ||
                r + 2 * ir === this.r && c + ic === this.c;
        },

        toString: function () {
            return this.white? "N": "n";
        }
    });

    if (node) {
        module.exports = Knight;
    } else {
        window.chess.chess_Knight = Knight;
    }

}(typeof exports !== "undefined" && global.exports !== exports));