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

    var Board = lib.Board;
    var Piece = lib.Piece;

    var board;

    gabarito.

    test("chess/Board").

    before(function () {
        board = new Board();
    }).

    clause(
    "should initialize the board with 8x8 and every square should be undefined",
    function () {
        var b = new Board();
        var s = b.squares;

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                assert.isUndefined(s[r][c]);
            }
        }
    }).

    clause("should put a piece on the given indicated square", function () {
        var s = board.squares;

        var p = new Piece();

        board.place(4, 4, p);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r === 4 && c === 4) {
                    assert.areSame(p, s[r][c]);
                } else {
                    assert.isUndefined(s[r][c]);
                }
            }
        }
    }).

    clause("should return true if a give square is empty, false otherwise",
    function () {
        board.place(1, 0, new Piece());

        assert.isTrue(board.isEmpty(0, 0));
        assert.isFalse(board.isEmpty(1, 0));
    }).

    clause("should return the piece at a given row and column", function () {
        var p = new Piece();
        board.place(0, 0, p);

        assert.areSame(p, board.pieceAt(0, 0));
    }).

    clause("should remove the piece from the given square", function () {
        var s = board.squares;

        board.place(0, 0, new Piece());
        board.remove(0, 0);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                assert.isUndefined(s[r][c]);
            }
        }
    }).

    clause(
    "toString should plot the board, empty squares are represented as dots, " +
    "otherwise it takes the piece's toString",
    function () {
        var expected =
            "........\n" +
            "........\n" +
            "........\n" +
            "........\n" +
            "........\n" +
            "........\n" +
            "........\n" +
            "o.......\n";

        var p = new Piece();

        p.toString = function () { return "o"; };

        board.place(0, 0, p);

        assert.areSame(expected, board.toString());
    });

}(typeof exports !== "undefined" && global.exports !== exports));
