(function (node) {
    "use strict";

    var Util = node? require("./Util"): window.chess.Util;

    var Piece = Util.dependency("Piece");

    /**
     * Represents a bishop within the chess game.
     *
     * @class chess.Bishop
     * @extends chess.Piece
     * @constructor
     *
     * @param {boolean} white
     * @param {chess.Chess} chess
     */
    var Bishop = function (white, chess) {
        Piece.call(this, white, chess);
    };

    /**
     * @class chess.Bishop
     * @extends chess.Piece
     * @constructor
     */
    Util.extend(Bishop, Piece);

    Util.merge(Bishop.prototype, {

        getMoves: function () {
            var board = this.chess.board;
            var moves = [];
            var r = this.r;
            var c = this.c;
            var w = this.white;
            var nr, nc;

            var probe = function (r, c) {
                var p = board.pieceAt(r, c);
                if (!p || p.white !== w) {
                    moves.push({ r: r, c: c });
                }

                return Boolean(p);
            };

            for (nr = r + 1, nc = c + 1; nr < 8 && nc < 8; nr += 1, nc += 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            for (nr = r + 1, nc = c - 1; nr < 8 && nc > -1; nr += 1, nc -= 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            for (nr = r - 1, nc = c - 1; nr > -1 && nc > -1; nr -= 1, nc -= 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            for (nr = r - 1, nc = c + 1; nr > -1 && nc < 8; nr -= 1, nc += 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            return moves;
        },

        threatensSquare: function (r, c) {
            var ir, ic, board;


            if (r === this.r && c === this.c ||
                    Math.abs(this.r - r) !== Math.abs(this.c - c)) {

                return false;
            }

            board = this.chess.board;

            ir = r < this.r? 1: -1;
            ic = c < this.c? 1: -1;

            r += ir;
            c += ic;

            while (r !== this.r) {
                if (!board.isEmpty(r, c)) {
                    return false;
                }

                r += ir;
                c += ic;
            }

            return true;
        },

        toString: function () {
            return this.white? "\u2657": "\u265D";
        }

    });

    if (node) {
        module.exports = Bishop;
    } else {
        window.chess.Bishop = Bishop;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
