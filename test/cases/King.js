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
    var King = lib.King;
    var Rook = lib.Rook;

    var chess;
    var board;

    gabarito.

    test("chess/King").

    before(function () {
        chess = new Chess();
        board = chess.board;
    }).

    clause("should be able to move orthogonally and diagonally", function () {
        var moves = new King(Piece.WHITE, chess).
            place(4, 4).
            getAvailableMoves();

        assert.areSame(8, moves.length);

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
            assert.isTrue(places.some(function (p) {
                return p.r === m.r && p.c === m.c; }));
        });
    }).

    clause("should threaten orthogonal and diagonal places", function () {
        var k = new King(Piece.WHITE, chess).place(4, 4);

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

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (aroundKing(r, c)) {
                    assert.isTrue(k.threatens(r, c));
                } else {
                    assert.isFalse(k.threatens(r, c));
                }
            }
        }
    }).

    clause("should be able to capture the adjacent opposing piece",
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
            new King(Piece.BLACK, chess).place(p.r, p.c);
        });

        var moves = new King(Piece.WHITE, chess).place(4, 4).
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
            new King(Piece.BLACK, chess).place(p.r, p.c);
        });

        assert.areSame(0, new King(Piece.BLACK, chess).place(4, 4).
                getAvailableMoves().length);
    }).

    // white king - left castling
    clause("white king should be able to castle left", function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 0);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        assert.isTrue(k.canCastleLeft());
    }).

    clause("white king shouldn't be able to castle left if there is no rook",
    function () {
        var k = new King(Piece.WHITE, chess).place(0, 4);

        assert.isFalse(k.canCastleLeft());
    }).

    clause("white king shouldn't be able to castle left if the rook has moved",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 0);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        r.hasMoved = true;

        assert.isFalse(k.canCastleLeft());
    }).

    clause("white king shouldn't be able to castle left if the king has moved",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 0);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        k.hasMoved = true;

        assert.isFalse(k.canCastleLeft());
    }).

    clause(
    "white king shouldn't be able to castle left if the king is in check",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 0);
        var k = new King(Piece.WHITE, chess).place(0, 4);
        chess.whiteKing = k;

        new Rook(Piece.BLACK, chess).place(1, 4);
        assert.isFalse(k.canCastleLeft());
    }).

    clause(
    "white king shouldn't be able to castle left if the king's passing is " +
    "threatened",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 0);
        var k = new King(Piece.WHITE, chess).place(0, 4);
        chess.whiteKing = k;

        new Rook(Piece.BLACK, chess).place(1, 3);
        assert.isFalse(k.canCastleLeft());
    }).

    clause(
    "white king shouldn't be able to castle left if the king's destination " +
    "is threatened",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 0);
        var k = new King(Piece.WHITE, chess).place(0, 4);
        chess.whiteKing = k;

        new Rook(Piece.BLACK, chess).place(1, 2);
        assert.isFalse(k.canCastleLeft());
    }).

    clause("white king should castle left", function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 0);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        assert.isTrue(k.getAvailableMoves().some(function (m) {
            return m.r === 0 && m.c === 2; }));

        k.move(0, 2);

        assert.areSame(k, board.pieceAt(0, 2));
        assert.areSame(r, board.pieceAt(0, 3));
    }).

    // white king - right castling
    clause("white king should be able to castle right", function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 7);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        assert.isTrue(k.canCastleRight());
    }).

    clause("white king shouldn't be able to castle right if there is no rook",
    function () {
        var k = new King(Piece.WHITE, chess).place(0, 4);

        assert.isFalse(k.canCastleRight());
    }).

    clause(
    "white king shouldn't be able to castle right if the rook has moved",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 7);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        r.hasMoved = true;

        assert.isFalse(k.canCastleRight());
    }).

    clause("white king shouldn't be able to castle right if the king has moved",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 7);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        k.hasMoved = true;

        assert.isFalse(k.canCastleRight());
    }).

    clause(
    "white king shouldn't be able to castle right if the king is in check",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 7);
        var k = new King(Piece.WHITE, chess).place(0, 4);
        chess.whiteKing = k;

        new Rook(Piece.BLACK, chess).place(1, 4);
        assert.isFalse(k.canCastleRight());
    }).

    clause(
    "white king shouldn't be able to castle right if the king's passing is " +
    "threatened",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 7);
        var k = new King(Piece.WHITE, chess).place(0, 4);
        chess.whiteKing = k;

        new Rook(Piece.BLACK, chess).place(1, 5);
        assert.isFalse(k.canCastleRight());
    }).

    clause(
    "white king shouldn't be able to castle right if the king's destination " +
    "is threatened",
    function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 7);
        var k = new King(Piece.WHITE, chess).place(0, 4);
        chess.whiteKing = k;

        new Rook(Piece.BLACK, chess).place(1, 6);
        assert.isFalse(k.canCastleRight());
    }).

    clause("white king should castle right", function () {
        var r = new Rook(Piece.WHITE, chess).place(0, 7);
        var k = new King(Piece.WHITE, chess).place(0, 4);

        assert.isTrue(k.getAvailableMoves().some(function (m) {
            return m.r === 0 && m.c === 6; }));

        k.move(0, 6);

        assert.areSame(k, board.pieceAt(0, 6));
        assert.areSame(r, board.pieceAt(0, 5));
    }).

    // black king - left castling
    clause("black king should be able to castle left", function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 0);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        assert.isTrue(k.canCastleLeft());
    }).

    clause("black king shouldn't be able to castle left if there is no rook",
    function () {
        var k = new King(Piece.BLACK, chess).place(7, 4);

        assert.isFalse(k.canCastleLeft());
    }).

    clause("black king shouldn't be able to castle left if the rook has moved",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 0);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        r.hasMoved = true;

        assert.isFalse(k.canCastleLeft());
    }).

    clause("black king shouldn't be able to castle left if the king has moved",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 0);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        k.hasMoved = true;

        assert.isFalse(k.canCastleLeft());
    }).

    clause(
    "black king shouldn't be able to castle left if the king is in check",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 0);
        var k = new King(Piece.BLACK, chess).place(7, 4);
        chess.blackKing = k;

        new Rook(Piece.WHITE, chess).place(1, 4);
        assert.isFalse(k.canCastleLeft());
    }).

    clause(
    "black king shouldn't be able to castle left if the king's passing is " +
    "threatened",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 0);
        var k = new King(Piece.BLACK, chess).place(7, 4);
        chess.blackKing = k;

        new Rook(Piece.WHITE, chess).place(1, 3);
        assert.isFalse(k.canCastleLeft());
    }).

    clause(
    "black king shouldn't be able to castle left if the king's destination " +
    "is threatened",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 0);
        var k = new King(Piece.BLACK, chess).place(7, 4);
        chess.blackKing = k;

        new Rook(Piece.WHITE, chess).place(1, 2);
        assert.isFalse(k.canCastleLeft());
    }).

    clause("black king should castle left", function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 0);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        chess.turn = false;

        assert.isTrue(k.getAvailableMoves().some(function (m) {
            return m.r === 7 && m.c === 2; }));

        k.move(7, 2);

        assert.areSame(k, board.pieceAt(7, 2));
        assert.areSame(r, board.pieceAt(7, 3));
    }).

    // black king - right castling
    clause("black king should be able to castle right", function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 7);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        assert.isTrue(k.canCastleRight());
    }).

    clause("black king shouldn't be able to castle right if there is no rook",
    function () {
        var k = new King(Piece.BLACK, chess).place(7, 4);

        assert.isFalse(k.canCastleRight());
    }).

    clause("black king shouldn't be able to castle right if the rook has moved",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 7);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        r.hasMoved = true;

        assert.isFalse(k.canCastleRight());
    }).

    clause("black king shouldn't be able to castle right if the king has moved",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 7);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        k.hasMoved = true;

        assert.isFalse(k.canCastleRight());
    }).

    clause(
    "black king shouldn't be able to castle right if the king is in check",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 7);
        var k = new King(Piece.BLACK, chess).place(7, 4);
        chess.blackKing = k;

        new Rook(Piece.WHITE, chess).place(1, 4);
        assert.isFalse(k.canCastleRight());
    }).

    clause(
    "black king shouldn't be able to castle right if the king's passing is " +
    "threatened",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 7);
        var k = new King(Piece.BLACK, chess).place(7, 4);
        chess.blackKing = k;

        new Rook(Piece.WHITE, chess).place(1, 5);
        assert.isFalse(k.canCastleRight());
    }).

    clause(
    "black king shouldn't be able to castle right if the king's destination " +
    "is threatened",
    function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 7);
        var k = new King(Piece.BLACK, chess).place(7, 4);
        chess.blackKing = k;

        new Rook(Piece.WHITE, chess).place(1, 6);
        assert.isFalse(k.canCastleRight());
    }).

    clause("black king should castle right", function () {
        var r = new Rook(Piece.BLACK, chess).place(7, 7);
        var k = new King(Piece.BLACK, chess).place(7, 4);

        chess.turn = false;

        assert.isTrue(k.getAvailableMoves().some(function (m) {
            return m.r === 7 && m.c === 6; }));

        k.move(7, 6);

        assert.areSame(k, board.pieceAt(7, 6));
        assert.areSame(r, board.pieceAt(7, 5));
    }).

    clause("black king should toString to '\u265A'", function () {
        assert.areSame("\u265A", new King(Piece.BLACK, chess).toString());
    }).

    clause("white king should toString to '\u2654'", function () {
        assert.areSame("\u2654", new King(Piece.WHITE, chess).toString());
    });

}(typeof exports !== "undefined" && global.exports !== exports));
