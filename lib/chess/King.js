modl.
uses("/util/Util").
uses("/chess/Piece").
unit(function (module, Util, Piece) {
    "use strict";

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

        move: function (r, c) {
            var chess, board, lastMove, black, fan;

            var diff = this.c - c;

            Piece.prototype.move.call(this, r, c);

            if (Math.abs(diff) === 2) {
                chess = this.chess;
                board = chess.board;
                lastMove = chess.lastMove();
                black = !this.white;

                lastMove.type = "castling";

                if (diff > 0) {
                    board.
                        pieceAt(r, 0).
                        place(r, c + 1);

                    fan = "0-0-0";
                } else {
                    board.
                        pieceAt(r, 7).
                        place(r, c - 1);

                    fan = "0-0";
                }

                if (chess.inCheckMate(black)) {
                    fan += "#";
                } else if (chess.inCheck(black)) {
                    fan += "+";
                }

                lastMove.fan = fan;
            }
        },

        threatensSquare: function (r, c) {
            return !(r === this.r && c === this.c) &&
                Math.abs(r - this.r) < 2 && Math.abs(c - this.c) < 2;
        },

        toString: function () {
            return this.white? "\u2654": "\u265A";
        }

    });

    module.exports = King;
});