(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

    var Pawn = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Pawn, Piece);

    Util.merge(Pawn.prototype, {

        getMoves: function () {
            var board = this.chess.board;
            var moves = [];
            var w = this.white;
            var r = this.r;
            var c = this.c;
            var fwd = w? 1: -1;
            var p, m;
            var that = this;

            r += fwd;

            // forward square
            if (board.isEmpty(r, c)) {
                moves.push({ r: r, c: c });
            }

            // forward diagonal squares
            [c + 1, c - 1].forEach(function (c) {
                p = board.pieceAt(r, c);
                if (p && p.white !== w) {
                    moves.push({ r: r, c: c });
                }
            }, this);


            p = enPassant.call(this);
            if (p) {
                moves.push({ r: r, c: p.c });
            }

            // 2nd forward square
            if (!this.hasMoved) {
                r += fwd;
                if (board.isEmpty(r, c)) {
                    moves.push({ r: r, c: c });
                }
            }

            return moves;
        },

        threatensSquare: function (r, c) {
            return Math.abs(c - this.c) === 1 &&
                this.r + (this.white? 1: -1) === r;
        },

        toString: function () {
            return this.white? "P": "p";
        }
    });

    var enPassant = function () {
        var moves = this.chess.moves;
        var fifth = this.white? 4: 3;
        var m;

        if (this.r === fifth && moves.length !== 0) {
            m = moves[moves.length - 1];
            if (m.piece instanceof Pawn &&
                    Math.abs(m.from.r - m.to.r) === 2 &&
                    Math.abs(m.to.c - this.c) === 1 &&
                    m.to.r === fifth) {

                return m.piece;
            }
        }
    };

    if (node) {
        module.exports = Pawn;
    } else {
        window.chess.chess_Pawn = Pawn;
    }

}(typeof exports !== "undefined" && global.exports !== exports));