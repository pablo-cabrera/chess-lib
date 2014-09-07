(function(node) {
    "use strict";

    var
        main = node? global: window,
        YUITest = main.YUITest || require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Board = require(cwd + "/lib/chess/Board"),
        Piece = require(cwd + "/lib/chess/Piece"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.b = new Board();
            },

            "should initialize the board with 8x8 and every square should be undefined": function () {
                var b = new Board();
                var s = b.squares;

                for (var r = 0; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        Assert.isUndefined(s[r][c]);
                    }
                }
            },

            "should put a piece on the given indicated square": function () {
                var s = this.b.squares;

                var p = new Piece();

                this.b.place(4, 4, p);

                for (var r = 0; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r === 4 && c === 4) {
                            Assert.areSame(p, s[r][c]);
                        } else {
                            Assert.isUndefined(s[r][c]);
                        }
                    }
                }
            },

            "should return true if a give square is empty, false otherwise": function () {
                this.b.place(1, 0, new Piece());

                Assert.isTrue(this.b.isEmpty(0, 0));
                Assert.isFalse(this.b.isEmpty(1, 0));
            },

            "should return the piece at a given row and column": function () {
                var p = new Piece();
                this.b.place(0, 0, p);

                Assert.areSame(p, this.b.pieceAt(0, 0));
            },

            "should remove the piece from the given square": function () {
                var s = this.b.squares;

                this.b.place(0, 0, new Piece());
                this.b.remove(0, 0);

                for (var r = 0; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        Assert.isUndefined(s[r][c]);
                    }
                }
            },

            "toString should plot the board, empty squares are represented as dots, otherwise it takes the piece's toString": function () {
                var expected =
                    "........\n" +
                    "........\n" +
                    "........\n" +
                    "........\n" +
                    "........\n" +
                    "........\n" +
                    "........\n" +
                    "o.......\n";

                var p = new Piece();

                p.toString = function () { return "o"; };

                this.b.place(0, 0, p);

                Assert.areSame(expected, this.b.toString());
            },

            name: "chess/Board"
        });

    YUITest.TestRunner.add(test);
}(typeof exports !== "undefined" && global.exports !== exports));