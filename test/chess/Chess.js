(function(node) {
    "use strict";

    var
        main = node? global: window,
        YUITest = main.YUITest || require("yuitest"),
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

            setUp: function() {
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

                [0, 7].forEach(function(c) {
                    assertPiece(0, c, Rook, true);
                    assertPiece(7, c, Rook, false);
                });

                [1, 6].forEach(function(c) {
                    assertPiece(0, c, Knight, true);
                    assertPiece(7, c, Knight, false);
                });

                [2, 5].forEach(function(c) {
                    assertPiece(0, c, Bishop, true);
                    assertPiece(7, c, Bishop, false);
                });

                [0, 7].forEach(function(r) {
                    assertPiece(r, 3, Queen, r === 0);
                    assertPiece(r, 4, King, r === 0);
                });

                Assert.areSame(b.pieceAt(0, 4), this.c.whiteKing);
                Assert.areSame(b.pieceAt(7, 4), this.c.blackKing);
            },

            name: "chess/Chess"
        });

    YUITest.TestRunner.add(test);
}(typeof exports !== "undefined" && global.exports !== exports));