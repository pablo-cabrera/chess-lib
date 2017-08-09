(function (node) {
    "use strict";

    var Util = node? require("./Util"): window.chess.Util;

    var Board = Util.dependency("Board");
    var Pawn = Util.dependency("Pawn");
    var Rook = Util.dependency("Rook");
    var Knight = Util.dependency("Knight");
    var Bishop = Util.dependency("Bishop");
    var Queen = Util.dependency("Queen");
    var King = Util.dependency("King");
    var Piece = Util.dependency("Piece");

    var WHITE = Piece.WHITE;
    var BLACK = Piece.BLACK;

    var preventCheck;

    var Chess = function () {
        this.turn = WHITE;
        this.board = new Board();
        this.moves = [];
        this.fan = [];
        this.whiteKing = undefined;
        this.blackKing = undefined;
        this.hasEnded = false;
        this.winner = undefined;
    };

    Util.merge(Chess.prototype, {

        reset: function () {
            this.board = new Board();

            for (var i = 0; i < 8; i += 1) {
                new Pawn(WHITE, this).place(1, i);
                new Pawn(BLACK, this).place(6, i);
            }

            new Rook(WHITE, this).place(0, 0);
            new Knight(WHITE, this).place(0, 1);
            new Bishop(WHITE, this).place(0, 2);
            new Queen(WHITE, this).place(0, 3);
            new Bishop(WHITE, this).place(0, 5);
            new Knight(WHITE, this).place(0, 6);
            new Rook(WHITE, this).place(0, 7);

            new Rook(BLACK, this).place(7, 0);
            new Knight(BLACK, this).place(7, 1);
            new Bishop(BLACK, this).place(7, 2);
            new Queen(BLACK, this).place(7, 3);
            new Bishop(BLACK, this).place(7, 5);
            new Knight(BLACK, this).place(7, 6);
            new Rook(BLACK, this).place(7, 7);

            this.whiteKing = new King(WHITE, this).place(0, 4);
            this.blackKing = new King(BLACK, this).place(7, 4);

            this.turn = WHITE;
            this.moves = [];
            this.fan = [];
            this.hasEnded = false;
            this.winner = undefined;
        },

        inCheck: function (w) {
            var r, c, p;
            var b = this.board;
            var k = w? this.whiteKing: this.blackKing;

            if (k) {
                for (r = 0; r < 8; r += 1) {
                    for (c = 0; c < 8; c += 1) {
                        p = b.pieceAt(r, c);
                        if (p) {
                            if (p && p.white !== w && p.threatens(k)) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        },

        inCheckMate: function (w) {
            var r, c, p, k, b, t;

            if (!this.inCheck(w)) {
                return false;
            }

            k = w? this.whiteKing: this.blackKing;

            if (k.getAvailableMoves().length !== 0) {
                return false;
            }

            b = this.board;

            t = false;
            for (r = 0; r < 8; r += 1) {
                for (c = 0; c < 8; c += 1) {
                    p = b.pieceAt(r, c);
                    if (p) {
                        if (p && p.white !== w && p.threatens(k)) {
                            if (t) {
                                return true;
                            } else {
                                t = true;
                            }
                        }
                    }
                }
            }

            for (r = 0; r < 8; r += 1) {
                for (c = 0; c < 8; c += 1) {
                    p = b.pieceAt(r, c);
                    if (p && p.white === w && preventCheck.call(this, p)) {
                        return false;
                    }
                }
            }

            return true;
        },

        nextTurn: function () {
            this.turn = !this.turn;
            var lastMove = this.lastMove();
            if (lastMove !== undefined) {
                this.fan.push(lastMove.fan);
            }

            if (this.inCheckMate(this.turn)) {
                this.hasEnded = true;
                this.winner = !this.turn;
                this.fan.push(this.winner? "1-0": "0-1");
            } else if (this.isStalemate()) {
                this.hasEnded = true;
                this.fan.push("\u00bd-\u00bd");
            }
        },

        isStalemate: function () {
            var w = this.turn;
            var b = this.board;
            var r, c, p;

            for (r = 0; r < 8; r += 1) {
                for (c = 0; c < 8; c += 1) {
                    p = this.board.pieceAt(r, c);
                    if (p && p.white === w &&
                            p.getAvailableMoves().length > 0) {

                        return false;
                    }
                }
            }

            return !this.inCheck(w);
        },

        lastMove: function () {
            var moves = this.moves;

            return moves[moves.length - 1];
        }

    });

    preventCheck = function (p) {
        var t = this;
        var b = t.board;
        var r = p.r;
        var c = p.c;

        var prevent = p.getAvailableMoves().some(function (m) {
            var destPiece = b.pieceAt(m.r, m.c);
            p.place(m.r, m.c);
            var prevent = !t.inCheck(p.white);
            if (destPiece) {
                destPiece.place(m.r, m.c);
            }

            return prevent;
        });

        p.place(r, c);

        return prevent;
    };

    if (node) {
        module.exports = Chess;
    } else {
        window.chess.Chess = Chess;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
