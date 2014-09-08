(function() {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),

        Chess = require(cwd + "/lib/chess/Chess"),
        Rook = require(cwd + "/lib/chess/Rook"),

        test = new YUITest.TestCase({

            setUp: function() {
                this.c = new Chess();
                this.b = this.c.board;
            },

            "should be able to move only orthogonally": function () {
                new Rook(true, this.c).
                    place(4, 4).
                    getAvailableMoves().
                    forEach(function (m) {
                        Assert.isTrue(m.r === 4 || m.c === 4);
                    });
            },

            "should threaten only orthogonal places": function () {
                var rook = new Rook(true, this.c).place(4, 4);

                for (var r = 0; r < 8; r += 1 ) {
                    for (var c = 0; c < 8; c += 1) {
                        if (r === 4 && c === 4 || r !== 4 && c !== 4) {
                            Assert.isFalse(rook.threatens(r, c));
                        } else {
                            Assert.isTrue(rook.threatens(r, c));
                        }
                    }
                }
            },

            "should not be able to move over other pieces": function () {
                new Rook(true, this.c).place(3, 4);
                new Rook(true, this.c).place(5, 4);
                new Rook(true, this.c).place(4, 3);
                new Rook(true, this.c).place(4, 5);

                Assert.areSame(0, new Rook(true, this.c).
                        place(4, 4).getAvailableMoves().length);
            },

            "should not be able to threaten over other pieces": function () {
                var r, c;

                new Rook(true, this.c).place(3, 4);
                new Rook(true, this.c).place(5, 4);
                new Rook(true, this.c).place(4, 3);
                new Rook(true, this.c).place(4, 5);

                var rook = new Rook(true, this.c).place(4, 4);

                c = 4;
                for (r = 0; r < 8; r+= 1) {
                    if (r < 3 || r > 5 || r === 4) {
                        Assert.isFalse(rook.threatens(r, c));
                    } else {
                        Assert.isTrue(rook.threatens(r, c));
                    }
                }

                r = 4;
                for (c = 0; c < 8; c +=1) {
                    if (c < 3 || c > 5 || c === 4) {
                        Assert.isFalse(rook.threatens(r, c));
                    } else {
                        Assert.isTrue(rook.threatens(r, c));
                    }
                }
            },

            "should be able to capture the first opposing piece it hits": function () {
                new Rook(false, this.c).place(3, 4);
                new Rook(false, this.c).place(5, 4);
                new Rook(false, this.c).place(4, 3);
                new Rook(false, this.c).place(4, 5);

                var moves = new Rook(true, this.c).place(4, 4).
                        getAvailableMoves();

                Assert.areSame(4, moves.length);

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 3 && m.c === 4; }));

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 5 && m.c === 4; }));

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 4 && m.c === 3; }));

                Assert.isTrue(moves.some(function (m) {
                        return m.r === 4 && m.c ===5; }));
            },

            "shouldn't be able to capture pieces of the same color": function () {
                new Rook(false, this.c).place(3, 4);
                new Rook(false, this.c).place(5, 4);
                new Rook(false, this.c).place(4, 3);
                new Rook(false, this.c).place(4, 5);

                Assert.areSame(0, new Rook(false, this.c).place(4, 4).
                        getAvailableMoves().length);
            },

            "black rook should toString to '\u265C'": function () {
                Assert.areSame("\u265C", new Rook(false, this.c).toString());
            },

            "white rook should toString to '\u2656'": function () {
                Assert.areSame("\u2656", new Rook(true, this.c).toString());
            },

            name: "chess/Rook"
        });

    YUITest.TestRunner.add(test);
}());