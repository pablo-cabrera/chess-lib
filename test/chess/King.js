(function(node) {
    "use strict";

    var
        main = node? global: window,
        YUITest = main.YUITest || require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        King = require(cwd + "/lib/chess/King"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.c = new Chess();
                this.b = this.c.board;
            },

            "should be able to move orthogonally and diagonally": function () {
                var moves = new King(true, this.c).
                    place(4, 4).
                    getAvailableMoves();

                Assert.areSame(8, moves.length);

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

                moves.forEach(function (m) {
                    Assert.isTrue(places.some(function (p) {
                        return p.r === m.r && p.c === m.c; }));
                });
            },

            "should threaten orthogonal and diagonal places": function () {
                var k = new King(true, this.c).place(4, 4);

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

                var aroundKing = function (r, c) {
                    return places.some(function (p) {
                        return p.r === r && p.c === c; });
                };

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (aroundKing(r, c)) {
                            Assert.isTrue(k.threatens(r, c));
                        } else {
                            Assert.isFalse(k.threatens(r, c));
                        }
                    }
                }
            },

            "should be able to capture the adjacent opposing piece": function () {
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
                    new King(false, chess).place(p.r, p.c);
                });

                var moves = new King(true, this.c).place(4, 4).
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
                    new King(false, chess).place(p.r, p.c);
                });

                Assert.areSame(0, new King(false, chess).place(4, 4).
                        getAvailableMoves().length);
            },

            name: "chess/King"
        });

    YUITest.TestRunner.add(test);
}(typeof exports !== "undefined" && global.exports !== exports));