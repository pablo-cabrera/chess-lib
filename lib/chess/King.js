(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

    var King = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(King, Piece);

    Util.merge(King.prototype, {

        getMoves: function () {
            var r = this.r;
            var c = this.c;
            var w = this.white;

            var chess = this.chess;
            var board = chess.board;

            var moves = [
                { r: r + 1, c: c - 1 },
                { r: r + 1, c: c },
                { r: r + 1, c: c + 1 },
                { r: r, c: c - 1 },
                { r: r, c: c + 1 },
                { r: r - 1, c: c - 1 },
                { r: r - 1, c: c },
                { r: r - 1, c: c + 1 }
            ].filter(function (m) {
                if (m.r < 0 || m.c < 0 || m.r > 7 || m.c > 7) {
                    return false;
                }

                var p = board.pieceAt(m.r, m.c);
                return !p || p.white !== w;
            });

            if (this.canCastleLeft()) {
                moves.push({ r: r, c: c - 2 });
            }

            if (this.canCastleRight()) {
                moves.push({ r: r, c: c + 2 });
            }

            return moves;
        },

        canCastleLeft: function () {
            var w = this.white;
            var r = this.r;
            var c = this.c;

            var chess = this.chess;
            var board = chess.board;

            if (this.hasMoved || chess.inCheck(w)) {
                return false;
            }

            var rook = board.pieceAt(r, 0);
            if (!rook || rook.hasMoved) {
                return false;
            }

            if ([1, 2, 3].some(function (c) { return !board.isEmpty(r, c); })) {
                return false;
            }

            try {
                this.place(r, c - 1);
                if (chess.inCheck(w)) {
                    return false;
                }

                this.place(r, c - 2);
                return !chess.inCheck(w);
            } finally {
                this.place(r, c);
            }
        },

        canCastleRight: function () {
            var w = this.white;
            var r = this.r;
            var c = this.c;

            var chess = this.chess;
            var board = chess.board;

            if (this.hasMoved || chess.inCheck(w)) {
                return false;
            }

            var rook = board.pieceAt(r, 7);
            if (!rook || rook.hasMoved) {
                return false;
            }

            if ([5, 6].some(function (c) { return !board.isEmpty(r, c); })) {
                return false;
            }

            try {
                this.place(r, c + 1);
                if (chess.inCheck(w)) {
                    return false;
                }

                this.place(r, c + 2);

                return !chess.inCheck(w);

            } finally {
                this.place(r, c);
            }
        },

//        move: function (r, c) {
//            var hadMoved = this.hasMoved;
//            var board;
//
//            Piece.prototype.move.call(this, r, c);
//
//            if (!hadMoved && Math.abs(this.c - c) === 2) {
//                board = this.chess.board;
//
//                if (this.c > c) {
//                    board.
//                        pieceAt(r, 0).
//                        place(r, c + 1);
//                } else {
//                    board.pieceAt(r, 0).
//                        place(r, c - 1);
//                }
//            }
//        },

        threatensSquare: function (r, c) {
            return this.getAvailableMoves().some(function (m) {
                return m.r === r && m.c === c;
            });
        },

        toString: function () {
            return this.white? "K": "k";
        }

    });

    var withinBoard = function (i) {
    };

    if (node) {
        module.exports = King;
    } else {
        window.chess.chess_King = King;
    }

}(typeof exports !== "undefined" && global.exports !== exports));