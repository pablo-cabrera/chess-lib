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
            Boolean(global.__coverage__)?
                "test/coverage/instrument/lib/index":
                "lib/index"));
    } else {
        gabarito = window.gabarito;
        lib = window.chess;
    }

    var assert = gabarito.assert;

    var Chess = lib.Chess;
    var Bishop = lib.Bishop;
    var Piece = lib.Piece;

    var chess;
    var board;

    gabarito.

    test("chess/Bishop").

    before(function () {
        chess = new Chess();
        board = chess.board;
    }).

    clause("should be able to move only diagonally", function () {
        new Bishop(Piece.WHITE, chess).
            place(4, 4).
            getAvailableMoves().
            forEach(function (m) {
                assert.areSame(Math.abs(4 - m.r), Math.abs(4 - m.c));
            });
    }).

    clause("should threaten only diagonal places", function () {
        var b = new Bishop(Piece.WHITE, chess).place(4, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (Math.abs(4 - r) ===  Math.abs(4 - c) && r !== 4) {
                    assert.isTrue(b.threatens(r, c));
                } else {
                    assert.isFalse(b.threatens(r, c));
                }
            }
        }
    }).

    clause("should not be able to move over other pieces", function () {
        new Bishop(Piece.WHITE, chess).place(3, 3);
        new Bishop(Piece.WHITE, chess).place(5, 3);
        new Bishop(Piece.WHITE, chess).place(5, 5);
        new Bishop(Piece.WHITE, chess).place(3, 5);

        assert.areSame(0, new Bishop(Piece.WHITE, chess).
                place(4, 4).getAvailableMoves().length);
    }).

    clause("should not be able to threaten over other pieces", function () {
        new Bishop(Piece.BLACK, chess).place(3, 3);
        new Bishop(Piece.BLACK, chess).place(5, 3);
        new Bishop(Piece.BLACK, chess).place(5, 5);
        new Bishop(Piece.BLACK, chess).place(3, 5);

        var b = new Bishop(Piece.WHITE, chess).place(4, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if ((r === 3 || r === 5) && (c === 3 || c === 5)) {
                    assert.isTrue(b.threatens(r, c));
                } else {
                    assert.isFalse(b.threatens(r, c));
                }
            }
        }
    }).

    clause("should be able to capture the first opposing piece it hits",
    function () {
        new Bishop(Piece.BLACK, chess).place(3, 3);
        new Bishop(Piece.BLACK, chess).place(5, 3);
        new Bishop(Piece.BLACK, chess).place(5, 5);
        new Bishop(Piece.BLACK, chess).place(3, 5);

        var moves = new Bishop(Piece.WHITE, chess).place(4, 4).
                getAvailableMoves();

        assert.areSame(4, moves.length);

        assert.isTrue(moves.some(function (m) {
                return m.r === 3 && m.c === 3; }));

        assert.isTrue(moves.some(function (m) {
                return m.r === 3 && m.c === 5; }));

        assert.isTrue(moves.some(function (m) {
                return m.r === 5 && m.c === 3; }));

        assert.isTrue(moves.some(function (m) {
                return m.r === 5 && m.c === 5; }));
    }).

    clause("black bishop should toString to '\u265D'", function () {
        assert.areSame("\u265D", new Bishop(Piece.BLACK, chess).toString());
    }).

    clause("white bishop should toString to '\u2657'", function () {
        assert.areSame("\u2657", new Bishop(Piece.WHITE, chess).toString());
    });

}(typeof exports !== "undefined" && global.exports !== exports));
