(function (node) {
    "use strict";

    var Util = node? require("./Util"): window.chess.Util;

    var Piece = Util.dependency("Piece");

    /**
     * Represents a rook within the chess game.
     *
     * @class chess.Rook
     * @extends chess.Piece
     * @constructor
     *
     * @param {boolean} white
     * @param {chess.Chess} chess
     */
    var Rook = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Rook, Piece);

    Util.merge(Rook.prototype, {

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

            for (nr = r + 1; nr < 8; nr += 1) {
                if (probe(nr, c)) {
                    break;
                }
            }

            for (nr = r - 1; nr > -1 ; nr -= 1) {
                if (probe(nr, c)) {
                    break;
                }
            }

            for (nc = c + 1; nc < 8; nc += 1) {
                if (probe(r, nc)) {
                    break;
                }
            }

            for (nc = c - 1; nc > -1; nc -= 1) {
                if (probe(r, nc)) {
                    break;
                }
            }

            return moves;
        },

        threatensSquare: function (r, c) {
            var i, p;
            var board = this.chess.board;

            if (r === this.r && c === this.c) {
                return false;
            } else if (r === this.r) {
                i = c < this.c? 1: -1;

                c += i;
                while (c !== this.c) {
                    if (!board.isEmpty(r, c)) {
                        return false;
                    }
                    c += i;
                }

                return true;
            } else if (c === this.c) {
                i = r < this.r? 1: -1;

                r += i;
                while (r !== this.r) {
                    if (!board.isEmpty(r, c)) {
                        return false;
                    }
                    r += i;
                }

                return true;
            }

            return false;
        },

        toString: function () {
            return this.white? "\u2656": "\u265C";
        }

    });

    if (node) {
        module.exports = Rook;
    } else {
        window.chess.Rook = Rook;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
