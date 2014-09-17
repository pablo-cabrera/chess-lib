(function() {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        Piece = require(cwd + "/lib/chess/Piece"),
        King = require(cwd + "/lib/chess/King"),
        Queen = require(cwd + "/lib/chess/Queen"),
        Rook = require(cwd + "/lib/chess/Rook"),
        Bishop = require(cwd + "/lib/chess/Bishop"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.c = new Chess();
                this.b = this.c.board;
                this.p = new Piece(true, this.c);

                this.p.getMoves = function () {
                    var moves = [];

                    for (var r = 0; r < 8; r += 1) {
                        for (var c = 0; c < 8; c += 1) {
                            if (r !== this.r || c !== this.c) {
                                moves.push({ r: r, c: c });
                            }
                        }
                    }

                    return moves;
                };
            },

            "should move the piece from one position to another": function () {
                this.p.place(0, 0).
                    move(1, 0);

                for (var r = 0; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r === 1 && c === 0) {
                            Assert.areSame(this.p, this.b.pieceAt(r, c));
                        } else {
                            Assert.isTrue(this.b.isEmpty(r, c));
                        }
                    }
                }
            },

            "should allow only moves from the availableMoves": function () {
                this.p.place(0, 0);
                this.p.getMoves = function () { return []; };

                try {
                    this.p.move(1, 0);
                } catch (e) {
                    Assert.areSame("Invalid move", e.message);
                }
            },

            "should log moves within the chess": function () {
                Assert.areSame(0, this.c.moves.length);

                var from = { r: 0, c: 0 };
                var to = { r: 1, c: 0 };

                this.p.place(from.r, from.c).
                    move(to.r, to.c);

                Assert.areSame(1, this.c.moves.length);

                var m = this.c.moves[0];
                Assert.areSame(this.p, m.piece);
                Assert.areSame(from.r, m.from.r);
                Assert.areSame(from.c, m.from.c);
                Assert.areSame(to.r, m.to.r);
                Assert.areSame(to.c, m.to.c);
            },

            "once a piece has been moved, it should be marked as hasMoved": function () {
                Assert.isFalse(this.p.hasMoved);

                this.p.place(0, 0).
                    move(1, 0);

                Assert.isTrue(this.p.hasMoved);
            },

            "the piece should not be allowed to move if if is not it's turn": function () {
                this.c.turn = false;

                try {
                    this.p.place(0, 0).move(1, 0);
                } catch (e) {
                    Assert.areSame("Invalid move", e.message);
                }
            },

            "when placed, the piece should update it's coordiates": function () {
                Assert.isUndefined(this.p.r);
                Assert.isUndefined(this.p.c);

                this.p.place(1, 2);

                Assert.areSame(1, this.p.r);
                Assert.areSame(2, this.p.c);
            },

            "when removed, the piece should have it's coordinates set as undefined": function () {
                this.p.place(1, 2);

                Assert.areSame(1, this.p.r);
                Assert.areSame(2, this.p.c);

                this.p.remove();

                Assert.isUndefined(this.p.r);
                Assert.isUndefined(this.p.c);
            },

            "should filter out moves that would put it's king in check": function () {
                var p = this.p;
                this.c.inCheck = function () {
                    return p.r === 0;
                };

                p.place(0, 0);

                var moves = p.getAvailableMoves();

                var hasMove = function (r, c) {
                    return moves.some(function (m) {
                            return m.r === r && m.c === c; });
                };

                Assert.areSame(56, moves.length);

                for (var r = 1; r < 8; r += 1) {
                    for (var c = 0; c < 8; c += 1) {
                        Assert.isTrue(hasMove(r, c));
                    }
                }
            },

            name: "chess/Piece"
        });

    YUITest.TestRunner.add(test);
}());