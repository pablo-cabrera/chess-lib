(function() {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        King = require(cwd + "/lib/chess/King"),
        Rook = require(cwd + "/lib/chess/Rook"),

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

            // white king - left castling
            "white king should be able to castle left": function () {
                var r = new Rook(true, this.c).place(0, 0);
                var k = new King(true, this.c).place(0, 4);

                Assert.isTrue(k.canCastleLeft());
            },

            "white king shouldn't be able to castle left if there is no rook": function () {
                var k = new King(true, this.c).place(0, 4);

                Assert.isFalse(k.canCastleLeft());
            },

            "white king shouldn't be able to castle left if the rook has moved": function () {
                var r = new Rook(true, this.c).place(0, 0);
                var k = new King(true, this.c).place(0, 4);

                r.hasMoved = true;

                Assert.isFalse(k.canCastleLeft());
            },

            "white king shouldn't be able to castle left if the king has moved": function () {
                var r = new Rook(true, this.c).place(0, 0);
                var k = new King(true, this.c).place(0, 4);

                k.hasMoved = true;

                Assert.isFalse(k.canCastleLeft());
            },

            "white king shouldn't be able to castle left if the king is in check": function () {
                var r = new Rook(true, this.c).place(0, 0);
                var k = new King(true, this.c).place(0, 4);
                this.c.whiteKing = k;

                new Rook(false, this.c).place(1, 4);
                Assert.isFalse(k.canCastleLeft());
            },

            "white king shouldn't be able to castle left if the king's passing is threatened": function () {
                var r = new Rook(true, this.c).place(0, 0);
                var k = new King(true, this.c).place(0, 4);
                this.c.whiteKing = k;

                new Rook(false, this.c).place(1, 3);
                Assert.isFalse(k.canCastleLeft());
            },

            "white king shouldn't be able to castle left if the king's destination is threatened": function () {
                var r = new Rook(true, this.c).place(0, 0);
                var k = new King(true, this.c).place(0, 4);
                this.c.whiteKing = k;

                new Rook(false, this.c).place(1, 2);
                Assert.isFalse(k.canCastleLeft());
            },

            "white king should castle left": function () {
                var r = new Rook(true, this.c).place(0, 0);
                var k = new King(true, this.c).place(0, 4);

                Assert.isTrue(k.getAvailableMoves().some(function (m) {
                    return m.r === 0 && m.c === 2; }));

                k.move(0, 2);

                Assert.areSame(k, this.b.pieceAt(0, 2));
                Assert.areSame(r, this.b.pieceAt(0, 3));
            },

            // white king - right castling
            "white king should be able to castle right": function () {
                var r = new Rook(true, this.c).place(0, 7);
                var k = new King(true, this.c).place(0, 4);

                Assert.isTrue(k.canCastleRight());
            },

            "white king shouldn't be able to castle right if there is no rook": function () {
                var k = new King(true, this.c).place(0, 4);

                Assert.isFalse(k.canCastleRight());
            },

            "white king shouldn't be able to castle right if the rook has moved": function () {
                var r = new Rook(true, this.c).place(0, 7);
                var k = new King(true, this.c).place(0, 4);

                r.hasMoved = true;

                Assert.isFalse(k.canCastleRight());
            },

            "white king shouldn't be able to castle right if the king has moved": function () {
                var r = new Rook(true, this.c).place(0, 7);
                var k = new King(true, this.c).place(0, 4);

                k.hasMoved = true;

                Assert.isFalse(k.canCastleRight());
            },

            "white king shouldn't be able to castle right if the king is in check": function () {
                var r = new Rook(true, this.c).place(0, 7);
                var k = new King(true, this.c).place(0, 4);
                this.c.whiteKing = k;

                new Rook(false, this.c).place(1, 4);
                Assert.isFalse(k.canCastleRight());
            },

            "white king shouldn't be able to castle right if the king's passing is threatened": function () {
                var r = new Rook(true, this.c).place(0, 7);
                var k = new King(true, this.c).place(0, 4);
                this.c.whiteKing = k;

                new Rook(false, this.c).place(1, 5);
                Assert.isFalse(k.canCastleRight());
            },

            "white king shouldn't be able to castle right if the king's destination is threatened": function () {
                var r = new Rook(true, this.c).place(0, 7);
                var k = new King(true, this.c).place(0, 4);
                this.c.whiteKing = k;

                new Rook(false, this.c).place(1, 6);
                Assert.isFalse(k.canCastleRight());
            },

            "white king should castle right": function () {
                var r = new Rook(true, this.c).place(0, 7);
                var k = new King(true, this.c).place(0, 4);

                Assert.isTrue(k.getAvailableMoves().some(function (m) {
                    return m.r === 0 && m.c === 6; }));

                k.move(0, 6);

                Assert.areSame(k, this.b.pieceAt(0, 6));
                Assert.areSame(r, this.b.pieceAt(0, 5));
            },

            // black king - left castling
            "black king should be able to castle left": function () {
                var r = new Rook(false, this.c).place(7, 0);
                var k = new King(false, this.c).place(7, 4);

                Assert.isTrue(k.canCastleLeft());
            },

            "black king shouldn't be able to castle left if there is no rook": function () {
                var k = new King(false, this.c).place(7, 4);

                Assert.isFalse(k.canCastleLeft());
            },

            "black king shouldn't be able to castle left if the rook has moved": function () {
                var r = new Rook(false, this.c).place(7, 0);
                var k = new King(false, this.c).place(7, 4);

                r.hasMoved = true;

                Assert.isFalse(k.canCastleLeft());
            },

            "black king shouldn't be able to castle left if the king has moved": function () {
                var r = new Rook(false, this.c).place(7, 0);
                var k = new King(false, this.c).place(7, 4);

                k.hasMoved = true;

                Assert.isFalse(k.canCastleLeft());
            },

            "black king shouldn't be able to castle left if the king is in check": function () {
                var r = new Rook(false, this.c).place(7, 0);
                var k = new King(false, this.c).place(7, 4);
                this.c.blackKing = k;

                new Rook(true, this.c).place(1, 4);
                Assert.isFalse(k.canCastleLeft());
            },

            "black king shouldn't be able to castle left if the king's passing is threatened": function () {
                var r = new Rook(false, this.c).place(7, 0);
                var k = new King(false, this.c).place(7, 4);
                this.c.blackKing = k;

                new Rook(true, this.c).place(1, 3);
                Assert.isFalse(k.canCastleLeft());
            },

            "black king shouldn't be able to castle left if the king's destination is threatened": function () {
                var r = new Rook(false, this.c).place(7, 0);
                var k = new King(false, this.c).place(7, 4);
                this.c.blackKing = k;

                new Rook(true, this.c).place(1, 2);
                Assert.isFalse(k.canCastleLeft());
            },

            "black king should castle left": function () {
                var r = new Rook(false, this.c).place(7, 0);
                var k = new King(false, this.c).place(7, 4);

                this.c.turn = false;

                Assert.isTrue(k.getAvailableMoves().some(function (m) {
                    return m.r === 7 && m.c === 2; }));

                k.move(7, 2);

                Assert.areSame(k, this.b.pieceAt(7, 2));
                Assert.areSame(r, this.b.pieceAt(7, 3));
            },

            // black king - right castling
            "black king should be able to castle right": function () {
                var r = new Rook(false, this.c).place(7, 7);
                var k = new King(false, this.c).place(7, 4);

                Assert.isTrue(k.canCastleRight());
            },

            "black king shouldn't be able to castle right if there is no rook": function () {
                var k = new King(false, this.c).place(7, 4);

                Assert.isFalse(k.canCastleRight());
            },

            "black king shouldn't be able to castle right if the rook has moved": function () {
                var r = new Rook(false, this.c).place(7, 7);
                var k = new King(false, this.c).place(7, 4);

                r.hasMoved = true;

                Assert.isFalse(k.canCastleRight());
            },

            "black king shouldn't be able to castle right if the king has moved": function () {
                var r = new Rook(false, this.c).place(7, 7);
                var k = new King(false, this.c).place(7, 4);

                k.hasMoved = true;

                Assert.isFalse(k.canCastleRight());
            },

            "black king shouldn't be able to castle right if the king is in check": function () {
                var r = new Rook(false, this.c).place(7, 7);
                var k = new King(false, this.c).place(7, 4);
                this.c.blackKing = k;

                new Rook(true, this.c).place(1, 4);
                Assert.isFalse(k.canCastleRight());
            },

            "black king shouldn't be able to castle right if the king's passing is threatened": function () {
                var r = new Rook(false, this.c).place(7, 7);
                var k = new King(false, this.c).place(7, 4);
                this.c.blackKing = k;

                new Rook(true, this.c).place(1, 5);
                Assert.isFalse(k.canCastleRight());
            },

            "black king shouldn't be able to castle right if the king's destination is threatened": function () {
                var r = new Rook(false, this.c).place(7, 7);
                var k = new King(false, this.c).place(7, 4);
                this.c.blackKing = k;

                new Rook(true, this.c).place(1, 6);
                Assert.isFalse(k.canCastleRight());
            },

            "black king should castle right": function () {
                var r = new Rook(false, this.c).place(7, 7);
                var k = new King(false, this.c).place(7, 4);

                this.c.turn = false;

                Assert.isTrue(k.getAvailableMoves().some(function (m) {
                    return m.r === 7 && m.c === 6; }));

                k.move(7, 6);

                Assert.areSame(k, this.b.pieceAt(7, 6));
                Assert.areSame(r, this.b.pieceAt(7, 5));
            },

            "black king should toString to '\u265A'": function () {
                Assert.areSame("\u265A", new King(false, this.c).toString());
            },

            "white king should toString to '\u2654'": function () {
                Assert.areSame("\u2654", new King(true, this.c).toString());
            },

            name: "chess/King"
        });

    YUITest.TestRunner.add(test);
}());