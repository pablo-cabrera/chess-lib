(function() {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        Bishop = require(cwd + "/lib/chess/Bishop"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.c = new Chess();
                this.b = this.c.board;


            },

            "should be able to move only diagonally": function () {
                new Bishop(true, this.c).
                    place(4, 4).
                    getAvailableMoves().
                    forEach(function (m) {
                        Assert.areSame(Math.abs(4 - m.r), Math.abs(4 - m.c));
                    });
            },

            "should threaten only diagonal places": function () {
                var b = new Bishop(true, this.c).place(4, 4);

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (Math.abs(4 - r) ===  Math.abs(4 - c) && r !== 4) {
                            Assert.isTrue(b.threatens(r, c));
                        } else {
                            Assert.isFalse(b.threatens(r, c));
                        }
                    }
                }
            },

            "should not be able to move over other pieces": function () {
                new Bishop(true, this.c).place(3, 3);
                new Bishop(true, this.c).place(5, 3);
                new Bishop(true, this.c).place(5, 5);
                new Bishop(true, this.c).place(3, 5);

                Assert.areSame(0, new Bishop(true, this.c).
                        place(4, 4).getAvailableMoves().length);
            },

            "should not be able to threaten over other pieces": function () {
                new Bishop(false, this.c).place(3, 3);
                new Bishop(false, this.c).place(5, 3);
                new Bishop(false, this.c).place(5, 5);
                new Bishop(false, this.c).place(3, 5);

                var b = new Bishop(true, this.c).place(4, 4);

                for (var r = 0; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        if ((r === 3 || r === 5) && (c === 3 || c === 5)) {
                            Assert.isTrue(b.threatens(r, c));
                        } else {
                            Assert.isFalse(b.threatens(r, c));
                        }
                    }
                }
            },

            "should be able to capture the first opposing piece it hits": function () {
                new Bishop(false, this.c).place(3, 3);
                new Bishop(false, this.c).place(5, 3);
                new Bishop(false, this.c).place(5, 5);
                new Bishop(false, this.c).place(3, 5);

                var moves = new Bishop(true, this.c).place(4, 4).
                        getAvailableMoves();

                Assert.areSame(4, moves.length);

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 3 && m.c === 3; }));

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 3 && m.c === 5; }));

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 5 && m.c === 3; }));

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 5 && m.c ===5; }));
            },

            "black bishop should toString to '\u265D'": function () {
                Assert.areSame("\u265D", new Bishop(false, this.c).toString());
            },

            "white bishop should toString to '\u2657'": function () {
                Assert.areSame("\u2657", new Bishop(true, this.c).toString());
            },

            name: "chess/Bishop"
        });

    YUITest.TestRunner.add(test);
}());