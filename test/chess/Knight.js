(function() {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        Knight = require(cwd + "/lib/chess/Knight"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.c = new Chess();
                this.b = this.c.board;
            },

            "should be able to move only in L shape": function () {
                var moves = [
                    { r: 2, c: 3 },
                    { r: 3, c: 2 },
                    { r: 5, c: 2 },
                    { r: 6, c: 3 },
                    { r: 2, c: 5 },
                    { r: 3, c: 6 },
                    { r: 5, c: 6 },
                    { r: 6, c: 5 }
                ];

                new Knight(true, this.c).
                    place(4, 4).
                    getAvailableMoves().
                    forEach(function (m) {
                        Assert.isTrue(moves.some(function(o) {
                            return m.r === o.r && m.c === o.c; }));
                    });
            },

            "should threaten all places it can actually move": function () {
                var k = new Knight(true, this.c).
                        place(4, 4);

                var moves = k.getAvailableMoves();

                var withinMoves = function (r, c) {
                    return moves.some(function (m) {
                        return m.r === r && m.c === c; });
                };

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (withinMoves(r, c)) {
                            Assert.isTrue(k.threatens(r, c));
                        } else {
                            Assert.isFalse(k.threatens(r, c));
                        }
                    }
                }
            },

            "should be able to move over other pieces": function () {
                var k = new Knight(true, this.c).place(4, 4);

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r !== 4 || c !== 4) {
                            new Knight(false, this.c).place(r, c);
                        }
                    }
                }

                Assert.areSame(8, k.getAvailableMoves().length);
            },

            "shouldn't be able to capture pieces of the same color": function () {
                var k = new Knight(true, this.c).place(4, 4);

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r !== 4 || c !== 4) {
                            new Knight(true, this.c).place(r, c);
                        }
                    }
                }

                Assert.areSame(0, k.getAvailableMoves().length);
            },

            "black knight should toString to '\u265E'": function () {
                Assert.areSame("\u265E", new Knight(false, this.c).toString());
            },

            "white knight should toString to '\u2658'": function () {
                Assert.areSame("\u2658", new Knight(true, this.c).toString());
            },


            name: "chess/Knight"
        });

    YUITest.TestRunner.add(test);
}());