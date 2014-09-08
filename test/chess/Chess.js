(function () {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        Pawn = require(cwd + "/lib/chess/Pawn"),
        Rook = require(cwd + "/lib/chess/Rook"),
        Knight = require(cwd + "/lib/chess/Knight"),
        Bishop = require(cwd + "/lib/chess/Bishop"),
        Queen = require(cwd + "/lib/chess/Queen"),
        King = require(cwd + "/lib/chess/King"),

        test = new YUITest.TestCase({

            setUp: function () {
                this.c = new Chess();
                this.b = this.c.board;
            },

            "reset should create a new board, set the starting position, set the turn to white and reset all moves": function () {
                this.c.reset();

                var b = this.c.board;

                Assert.areNotSame(this.b, this.c.board);
                Assert.isTrue(this.c.turn);
                Assert.areSame(0, this.c.moves.length);

                var assertPiece = function (r, c, t, w) {
                    var p =  b.pieceAt(r, c);
                    Assert.isInstanceOf(t, p);
                    Assert.areSame(w, p.white);
                    Assert.isFalse(p.hasMoved);
                    Assert.areSame(r, p.r);
                    Assert.areSame(c, p.c);
                };

                for (var i = 0; i < 8; i += 1) {
                    assertPiece(6, i, Pawn, false);
                    assertPiece(1, i, Pawn, true);

                    Assert.isTrue(b.isEmpty(2, i));
                    Assert.isTrue(b.isEmpty(3, i));
                    Assert.isTrue(b.isEmpty(4, i));
                    Assert.isTrue(b.isEmpty(5, i));
                }

                [0, 7].forEach(function (c) {
                    assertPiece(0, c, Rook, true);
                    assertPiece(7, c, Rook, false);
                });

                [1, 6].forEach(function (c) {
                    assertPiece(0, c, Knight, true);
                    assertPiece(7, c, Knight, false);
                });

                [2, 5].forEach(function (c) {
                    assertPiece(0, c, Bishop, true);
                    assertPiece(7, c, Bishop, false);
                });

                [0, 7].forEach(function (r) {
                    assertPiece(r, 3, Queen, r === 0);
                    assertPiece(r, 4, King, r === 0);
                });

                Assert.areSame(b.pieceAt(0, 4), this.c.whiteKing);
                Assert.areSame(b.pieceAt(7, 4), this.c.blackKing);
            },

            "should tell that there is no king in check if there are no kings on the board": function () {
                Assert.isFalse(this.c.inCheck(true));
                Assert.isFalse(this.c.inCheck(false));
            },

            "should tell that white is in check if a black piece threatens the white king": function () {
                new Rook(false, this.c).place(1, 0);
                this.c.whiteKing = new King(true, this.c).place(0, 0);

                Assert.isTrue(this.c.inCheck(true));
            },

            "should tell that black is in check if a white piece threatens the black king": function () {
                new Rook(true, this.c).place(1, 0);
                this.c.blackKing = new King(false, this.c).place(0, 0);

                Assert.isTrue(this.c.inCheck(false));
            },

            "should tell that there is no king in check mate if there are no kings on the board": function () {
                Assert.isFalse(this.c.inCheckMate(true));
                Assert.isFalse(this.c.inCheckMate(false));
            },

            "should tell that white king is in check mate if it is in check and there are no more available moves": function () {
                new Rook(false, this.c).place(0, 7);
                new Rook(false, this.c).place(1, 7);

                this.c.whiteKing = new King(true, this.c).place(0, 0);

                Assert.isTrue(this.c.inCheckMate(true));
            },

            "should tell that black king is in check mate if it is in check and there are no more available moves": function () {
                new Rook(true, this.c).place(0, 7);
                new Rook(true, this.c).place(1, 7);

                this.c.blackKing = new King(false, this.c).place(0, 0);

                Assert.isTrue(this.c.inCheckMate(false));
            },

            "should not tell that the white king is in check mate if the king is in check, there are no available moves for the king, but the threatening piece could be taken down": function () {
                new Rook(false, this.c).place(0, 7);
                new Rook(false, this.c).place(1, 7);

                new Bishop(true, this.c).place(2, 5);

                this.c.whiteKing = new King(true, this.c).place(0, 0);

                Assert.isFalse(this.c.inCheckMate(true));
            },

            "nextTurn should switch the turn": function () {
                Assert.isTrue(this.c.turn);
                this.c.nextTurn();
                Assert.isFalse(this.c.turn);
            },

            name: "chess/Chess"
        });

    YUITest.TestRunner.add(test);
}());