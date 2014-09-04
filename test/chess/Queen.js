(function(node) {
    "use strict";

    var
        main = node? global: window,
        YUITest = main.YUITest || require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        Queen = require(cwd + "/lib/chess/Queen"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.c = new Chess();
                this.b = this.c.board;
            },

            "should be able to move orthogonally and diagonally": function () {
                new Queen(true, this.c).
                    place(4, 4).
                    getAvailableMoves().
                    forEach(function (m) {
                        Assert.isTrue((m.r === 4 || m.c === 4) ||
                            Math.abs(4 - m.r) === Math.abs(4 - m.c));
                    });
            },

            "should threaten orthogonal and diagonal places": function () {
                var q = new Queen(true, this.c).place(4, 4);

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (!(r === 4 && c === 4) &&
                                (r === 4 || c === 4 ||
                                Math.abs(4 - r) === Math.abs(4 - c))) {

                            Assert.isTrue(q.threatens(r, c));
                        } else {
                            Assert.isFalse(q.threatens(r, c));
                        }
                    }
                }
            },

            "should not be able to move over other pieces": function () {
                new Queen(true, this.c).place(3, 4);
                new Queen(true, this.c).place(5, 4);
                new Queen(true, this.c).place(3, 3);
                new Queen(true, this.c).place(4, 3);
                new Queen(true, this.c).place(5, 3);
                new Queen(true, this.c).place(3, 5);
                new Queen(true, this.c).place(4, 5);
                new Queen(true, this.c).place(5, 5);

                Assert.areSame(0, new Queen(true, this.c).
                        place(4, 4).getAvailableMoves().length);
            },

            "should not be able to threaten over other pieces": function () {
                new Queen(true, this.c).place(3, 4);
                new Queen(true, this.c).place(5, 4);
                new Queen(true, this.c).place(3, 3);
                new Queen(true, this.c).place(4, 3);
                new Queen(true, this.c).place(5, 3);
                new Queen(true, this.c).place(3, 5);
                new Queen(true, this.c).place(4, 5);
                new Queen(true, this.c).place(5, 5);

                var q = new Queen(true, this.c).place(4, 4);

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r === 4 && c === 4) {
                            Assert.isFalse(q.threatens(r, c));
                        } else if (r > 2 && r < 6 && c > 2 && c < 6) {
                            Assert.isTrue(q.threatens(r, c));
                        } else {
                            Assert.isFalse(q.threatens(r, c));
                        }
                    }
                }
            },

            "should be able to capture the first opposing piece it hits": function () {
                var places = [
                    { r: 3, c: 4 },
                    { r: 5, c: 4 },
                    { r: 3, c: 3 },
                    { r: 4, c: 3 },
                    { r: 5, c: 3 },
                    { r: 3, c: 5 },
                    { r: 4, c: 5 },
                    { r: 5, c: 5 }
                ];

                var chess = this.c;

                places.forEach(function (p) {
                    new Queen(false, chess).place(p.r, p.c);
                });

                var moves = new Queen(true, this.c).place(4, 4).
                        getAvailableMoves();

                Assert.areSame(8, moves.length);

                moves.forEach(function (m) {
                    Assert.isTrue(places.some(function (p) {
                        return p.r === m.r && p.c === m.c; }));
                });
            },

            "shouldn't be able to capture pieces of the same color": function () {
                var chess = this.c;

                [
                    { r: 3, c: 4 },
                    { r: 5, c: 4 },
                    { r: 3, c: 3 },
                    { r: 4, c: 3 },
                    { r: 5, c: 3 },
                    { r: 3, c: 5 },
                    { r: 4, c: 5 },
                    { r: 5, c: 5 }
                ].forEach(function (p) {
                    new Queen(false, chess).place(p.r, p.c);
                });

                Assert.areSame(0, new Queen(false, chess).place(4, 4).
                        getAvailableMoves().length);
            },

            name: "chess/Queen"
        });

    YUITest.TestRunner.add(test);
}(typeof exports !== "undefined" && global.exports !== exports));