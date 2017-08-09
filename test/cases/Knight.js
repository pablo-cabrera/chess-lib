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

    var Chess = lib.Chess;
    var Knight = lib.Knight;
    var Piece = lib.Piece;

    var chess;
    var board;

    gabarito.

    test("chess/Knight").

    before(function () {
        chess = new Chess();
        board = chess.board;
    }).

    clause("should be able to move only in L shape", function () {
        var moves = [
            { r: 2, c: 3 },
            { r: 3, c: 2 },
            { r: 5, c: 2 },
            { r: 6, c: 3 },
            { r: 2, c: 5 },
            { r: 3, c: 6 },
            { r: 5, c: 6 },
            { r: 6, c: 5 }
        ];

        new Knight(Piece.WHITE, chess).
            place(4, 4).
            getAvailableMoves().
            forEach(function (m) {
                assert.isTrue(moves.some(function (o) {
                    return m.r === o.r && m.c === o.c; }));
            });
    }).

    clause("should threaten all places it can actually move", function () {
        var k = new Knight(Piece.WHITE, chess).
                place(4, 4);

        var moves = k.getAvailableMoves();

        var withinMoves = function (r, c) {
            return moves.some(function (m) {
                return m.r === r && m.c === c; });
        };

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (withinMoves(r, c)) {
                    assert.isTrue(k.threatens(r, c));
                } else {
                    assert.isFalse(k.threatens(r, c));
                }
            }
        }
    }).

    clause("should be able to move over other pieces", function () {
        var k = new Knight(Piece.WHITE, chess).place(4, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r !== 4 || c !== 4) {
                    new Knight(Piece.BLACK, chess).place(r, c);
                }
            }
        }

        assert.areSame(8, k.getAvailableMoves().length);
    }).

    clause("shouldn't be able to capture pieces of the same color",
    function () {
        var k = new Knight(Piece.WHITE, chess).place(4, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r !== 4 || c !== 4) {
                    new Knight(Piece.WHITE, chess).place(r, c);
                }
            }
        }

        assert.areSame(0, k.getAvailableMoves().length);
    }).

    clause("black knight should toString to '\u265E'", function () {
        assert.areSame("\u265E", new Knight(Piece.BLACK, chess).toString());
    }).

    clause("white knight should toString to '\u2658'", function () {
        assert.areSame("\u2658", new Knight(Piece.WHITE, chess).toString());
    });

}(typeof exports !== "undefined" && global.exports !== exports));
