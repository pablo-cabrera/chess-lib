(function (node) {
    "use strict";

    var gabarito;
    var lib;
    var path;

    if (node) {
        path = require("path");
        gabarito = require("gabarito");
        lib = require(path.join(
            process.cwd(),
            Boolean(global.__COVERAGE__)?
                "test/coverage/instrument/lib/index":
                "lib/index"));
    } else {
        gabarito = window.gabarito;
        lib = window.chess;
    }

    var assert = gabarito.assert;

    var Piece = lib.Piece;
    var Chess = lib.Chess;
    var Queen = lib.Queen;

    var chess;
    var board;

    gabarito.

    test("chess/Queen").

    before(function () {
        chess = new Chess();
        board = chess.board;
    }).

    clause("should be able to move orthogonally and diagonally", function () {
        new Queen(Piece.WHITE, chess).
            place(4, 4).
            getAvailableMoves().
            forEach(function (m) {
                assert.isTrue((m.r === 4 || m.c === 4) ||
                    Math.abs(4 - m.r) === Math.abs(4 - m.c));
            });
    }).

    clause("should threaten orthogonal and diagonal places", function () {
        var q = new Queen(Piece.WHITE, chess).place(4, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (!(r === 4 && c === 4) &&
                        (r === 4 || c === 4 ||
                        Math.abs(4 - r) === Math.abs(4 - c))) {

                    assert.isTrue(q.threatens(r, c));
                } else {
                    assert.isFalse(q.threatens(r, c));
                }
            }
        }
    }).

    clause("should not be able to move over other pieces", function () {
        new Queen(Piece.WHITE, chess).place(3, 4);
        new Queen(Piece.WHITE, chess).place(5, 4);
        new Queen(Piece.WHITE, chess).place(3, 3);
        new Queen(Piece.WHITE, chess).place(4, 3);
        new Queen(Piece.WHITE, chess).place(5, 3);
        new Queen(Piece.WHITE, chess).place(3, 5);
        new Queen(Piece.WHITE, chess).place(4, 5);
        new Queen(Piece.WHITE, chess).place(5, 5);

        assert.areSame(0, new Queen(Piece.WHITE, chess).
                place(4, 4).getAvailableMoves().length);
    }).

    clause("should not be able to threaten over other pieces", function () {
        new Queen(Piece.WHITE, chess).place(3, 4);
        new Queen(Piece.WHITE, chess).place(5, 4);
        new Queen(Piece.WHITE, chess).place(3, 3);
        new Queen(Piece.WHITE, chess).place(4, 3);
        new Queen(Piece.WHITE, chess).place(5, 3);
        new Queen(Piece.WHITE, chess).place(3, 5);
        new Queen(Piece.WHITE, chess).place(4, 5);
        new Queen(Piece.WHITE, chess).place(5, 5);

        var q = new Queen(Piece.WHITE, chess).place(4, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r === 4 && c === 4) {
                    assert.isFalse(q.threatens(r, c));
                } else if (r > 2 && r < 6 && c > 2 && c < 6) {
                    assert.isTrue(q.threatens(r, c));
                } else {
                    assert.isFalse(q.threatens(r, c));
                }
            }
        }
    }).

    clause("should be able to capture the first opposing piece it hits",
    function () {
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

        places.forEach(function (p) {
            new Queen(Piece.BLACK, chess).place(p.r, p.c);
        });

        var moves = new Queen(Piece.WHITE, chess).place(4, 4).
                getAvailableMoves();

        assert.areSame(8, moves.length);

        moves.forEach(function (m) {
            assert.isTrue(places.some(function (p) {
                return p.r === m.r && p.c === m.c; }));
        });
    }).

    clause("shouldn't be able to capture pieces of the same color",
    function () {
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
            new Queen(Piece.BLACK, chess).place(p.r, p.c);
        });

        assert.areSame(0, new Queen(Piece.BLACK, chess).place(4, 4).
                getAvailableMoves().length);
    }).

    clause("black queen should toString to '\u265B'", function () {
        assert.areSame("\u265B", new Queen(Piece.BLACK, chess).toString());
    }).

    clause("white queen should toString to '\u2655'", function () {
        assert.areSame("\u2655", new Queen(Piece.WHITE, chess).toString());
    });

}(typeof exports !== "undefined" && global.exports !== exports));
