(function(node) {
    "use strict";

    var
        main = node? global: window,
        YUITest = main.YUITest || require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        Pawn = require(cwd + "/lib/chess/Pawn"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.c = new Chess();
                this.b = this.c.board;
            },

            "black pawn should toString to 'p'": function () {
                Assert.areSame("p", new Pawn(false, this.c).toString());
            },

            "white pawn should toString to 'P'": function () {
                Assert.areSame("P", new Pawn(true, this.c).toString());
            },

            "pawns should be able to move forward only": function () {
                new Pawn(true, this.c).
                    place(1, 1).
                    getAvailableMoves().forEach(function (m) {
                        Assert.areSame(1, m.c);
                        Assert.isTrue(m.r > 1);
                    });

                new Pawn(false, this.c).
                    place(6, 1).
                    getAvailableMoves().forEach(function (m) {
                        Assert.areSame(1, m.c);
                        Assert.isTrue(m.r < 6);
                    });
            },

            "pawns that hasn't moved, should be able to move two squares forward": function () {
                Assert.isTrue(
                    new Pawn(true, this.c).
                        place(1, 1).
                        getAvailableMoves().some(function (m) {
                            return m.c === 1 && m.r === 3;
                        }));

                Assert.isTrue(
                    new Pawn(false, this.c).
                        place(6, 1).
                        getAvailableMoves().some(function (m) {
                            return m.c === 1 && m.r === 4;
                        }));
            },

            "pawns should be able to threaten adjacent forward diagonals": function () {
                var wp = new Pawn(true, this.c).place(1, 1);
                var bp = new Pawn(false, this.c).place(6, 1);

                var r, c;

                for (r = 0; r < 8; r += 1) {
                    for (c = 0; c < 8; c += 1) {
                        if (r === 2 && Math.abs(c - 1) === 1) {
                            Assert.isTrue(wp.threatens(r, c));
                        } else if (r === 5 && Math.abs(c - 1) === 1) {
                            Assert.isTrue(bp.threatens(r, c));
                        } else {
                            Assert.isFalse(bp.threatens(r, c));
                            Assert.isFalse(wp.threatens(r, c));
                        }
                    }
                }
            },

            "white pawn should be able to perform en passant to the left": function () {
                var p = new Pawn(true, this.c).place(4, 1);

                new Pawn(false, this.c).place(6, 0).
                    move(4, 0);

                Assert.isTrue(p.getAvailableMoves().
                    some(function (m) { return m.r === 5 && m.c === 0; }));
            },

            "white pawn should be able to perform en passant to the right": function () {
                var p = new Pawn(true, this.c).place(4, 1);

                new Pawn(false, this.c).place(6, 2).
                    move(4, 2);

                Assert.isTrue(p.getAvailableMoves().
                    some(function (m) { return m.r === 5 && m.c === 2; }));
            },

            "black pawn should be able to perform en passant to the left": function () {
                var p = new Pawn(false, this.c).place(3, 1);

                new Pawn(true, this.c).place(1, 0).
                    move(3, 0);

                Assert.isTrue(p.getAvailableMoves().
                    some(function (m) { return m.r === 2 && m.c === 0; }));
            },

            "black pawn should be able to perform en passant to the right": function () {
                var p = new Pawn(false, this.c).place(3, 1);

                new Pawn(true, this.c).place(1, 2).
                    move(3, 2);

                Assert.isTrue(p.getAvailableMoves().
                    some(function (m) { return m.r === 2 && m.c === 2; }));
            },

            "en passant should only be allowed just after the opposing pawn has just been moved": function () {
                var p = new Pawn(false, this.c).place(3, 1);
                new Pawn(false, this.c).place(6, 7);
                new Pawn(true, this.c).place(1, 2);
                new Pawn(true, this.c).place(1, 7);

                this.b.pieceAt(1, 2).move(3, 2);
                this.b.pieceAt(6, 7).move(5, 7);
                this.b.pieceAt(1, 7).move(2, 7);

                p.getAvailableMoves().forEach(function (m) {
                    Assert.isFalse(m.r === 2 && m.c === 2);
                });
            },

            "white pawn should be able to capture forward diagonals only": function () {
                var p = new Pawn(true, this.c).place(1, 4);

                for (var r = 0; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r !== 1 || c !== 4) {
                            new Pawn(false, this.c).place(r, c);
                        }
                    }
                }

                var moves = p.getAvailableMoves();
                Assert.areSame(2, moves.length);
                Assert.isTrue(moves.some(function (m) {
                    return m.r === 2 && m.c === 3; }));

                Assert.isTrue(moves.some(function (m) {
                    return m.r === 2 && m.c === 5; }));
            },

            "black pawn should be able to capture forward diagonals only": function () {
                var p = new Pawn(false, this.c).place(6, 4);

                for (var r = 0; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r !== 6 || c !== 4) {
                            new Pawn(true, this.c).place(r, c);
                        }
                    }
                }

                var moves = p.getAvailableMoves();
                Assert.areSame(2, moves.length);
                Assert.isTrue(moves.some(function (m) {
                    return m.r === 5 && m.c === 3; }));

                Assert.isTrue(moves.some(function (m) {
                    return m.r === 5 && m.c === 5; }));
            },

            name: "chess/Pawn"
        });

    YUITest.TestRunner.add(test);
}(typeof exports !== "undefined" && global.exports !== exports));