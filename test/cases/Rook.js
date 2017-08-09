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
    var Rook = lib.Rook;

    var chess;
    var board;

    gabarito.

    test("chess/Rook").

    before(function () {
        chess = new Chess();
        board = chess.board;
    }).

    clause("should be able to move only orthogonally", function () {
        var moves = new Rook(Piece.WHITE, chess).
            place(4, 4).
            getAvailableMoves();

        assert.areSame(14, moves.length);
        moves.forEach(function (m) {
                assert.isTrue(m.r === 4 || m.c === 4);
            });
    }).

    clause("should threaten only orthogonal places", function () {
        var rook = new Rook(Piece.WHITE, chess).place(4, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r === 4 && c === 4 || r !== 4 && c !== 4) {
                    assert.isFalse(rook.threatens(r, c));
                } else {
                    assert.isTrue(rook.threatens(r, c));
                }
            }
        }
    }).

    clause("should not be able to move over other pieces", function () {
        new Rook(Piece.WHITE, chess).place(3, 4);
        new Rook(Piece.WHITE, chess).place(5, 4);
        new Rook(Piece.WHITE, chess).place(4, 3);
        new Rook(Piece.WHITE, chess).place(4, 5);

        assert.areSame(0, new Rook(Piece.WHITE, chess).
                place(4, 4).getAvailableMoves().length);
    }).

    clause("should not be able to threaten over other pieces", function () {
        var r, c;

        new Rook(Piece.WHITE, chess).place(3, 4);
        new Rook(Piece.WHITE, chess).place(5, 4);
        new Rook(Piece.WHITE, chess).place(4, 3);
        new Rook(Piece.WHITE, chess).place(4, 5);

        var rook = new Rook(Piece.WHITE, chess).place(4, 4);

        c = 4;
        for (r = 0; r < 8; r += 1) {
            if (r < 3 || r > 5 || r === 4) {
                assert.isFalse(rook.threatens(r, c));
            } else {
                assert.isTrue(rook.threatens(r, c));
            }
        }

        r = 4;
        for (c = 0; c < 8; c += 1) {
            if (c < 3 || c > 5 || c === 4) {
                assert.isFalse(rook.threatens(r, c));
            } else {
                assert.isTrue(rook.threatens(r, c));
            }
        }
    }).

    clause("should be able to capture the first opposing piece it hits",
    function () {
        new Rook(Piece.BLACK, chess).place(3, 4);
        new Rook(Piece.BLACK, chess).place(5, 4);
        new Rook(Piece.BLACK, chess).place(4, 3);
        new Rook(Piece.BLACK, chess).place(4, 5);

        var moves = new Rook(Piece.WHITE, chess).place(4, 4).
                getAvailableMoves();

        assert.areSame(4, moves.length);

        assert.isTrue(moves.some(function (m) {
                return m.r === 3 && m.c === 4; }));

        assert.isTrue(moves.some(function (m) {
                return m.r === 5 && m.c === 4; }));

        assert.isTrue(moves.some(function (m) {
                return m.r === 4 && m.c === 3; }));

        assert.isTrue(moves.some(function (m) {
                return m.r === 4 && m.c === 5; }));
    }).

    clause("shouldn't be able to capture pieces of the same color",
    function () {
        new Rook(Piece.BLACK, chess).place(3, 4);
        new Rook(Piece.BLACK, chess).place(5, 4);
        new Rook(Piece.BLACK, chess).place(4, 3);
        new Rook(Piece.BLACK, chess).place(4, 5);

        assert.areSame(0, new Rook(Piece.BLACK, chess).place(4, 4).
                getAvailableMoves().length);
    }).

    clause("black rook should toString to '\u265C'", function () {
        assert.areSame("\u265C", new Rook(Piece.BLACK, chess).toString());
    }).

    clause("white rook should toString to '\u2656'", function () {
        assert.areSame("\u2656", new Rook(Piece.WHITE, chess).toString());
    });

}(typeof exports !== "undefined" && global.exports !== exports));
