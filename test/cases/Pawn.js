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
    var Pawn = lib.Pawn;
    var King = lib.King;
    var Queen = lib.Queen;
    var Bishop = lib.Bishop;
    var Knight = lib.Knight;
    var Rook = lib.Rook;

    var chess;
    var board;

    gabarito.

    test("chess/Pawn").

    before(function () {
        chess = new Chess();
        board = chess.board;
    }).

    clause("black pawn should toString to '\u265F'", function () {
        assert.areSame("\u265F", new Pawn(Piece.BLACK, chess).toString());
    }).

    clause("white pawn should toString to '\u2659'", function () {
        assert.areSame("\u2659", new Pawn(Piece.WHITE, chess).toString());
    }).

    clause("pawns should be able to move forward only", function () {
        new Pawn(Piece.WHITE, chess).
            place(1, 1).
            getAvailableMoves().forEach(function (m) {
                assert.areSame(1, m.c);
                assert.isTrue(m.r > 1);
            });

        new Pawn(Piece.BLACK, chess).
            place(6, 1).
            getAvailableMoves().forEach(function (m) {
                assert.areSame(1, m.c);
                assert.isTrue(m.r < 6);
            });
    }).

    clause(
    "pawns that hasn't moved, should be able to move two squares forward",
    function () {
        assert.isTrue(
            new Pawn(Piece.WHITE, chess).
                place(1, 1).
                getAvailableMoves().some(function (m) {
                    return m.c === 1 && m.r === 3;
                }));

        assert.isTrue(
            new Pawn(Piece.BLACK, chess).
                place(6, 1).
                getAvailableMoves().some(function (m) {
                    return m.c === 1 && m.r === 4;
                }));
    }).

    clause("pawns should be able to threaten adjacent forward diagonals",
    function () {
        var wp = new Pawn(Piece.WHITE, chess).place(1, 1);
        var bp = new Pawn(Piece.BLACK, chess).place(6, 1);

        var r, c;

        for (r = 0; r < 8; r += 1) {
            for (c = 0; c < 8; c += 1) {
                if (r === 2 && Math.abs(c - 1) === 1) {
                    assert.isTrue(wp.threatens(r, c));
                } else if (r === 5 && Math.abs(c - 1) === 1) {
                    assert.isTrue(bp.threatens(r, c));
                } else {
                    assert.isFalse(bp.threatens(r, c));
                    assert.isFalse(wp.threatens(r, c));
                }
            }
        }
    }).

    clause("white pawn should be able to perform en passant to the left",
    function () {
        var p = new Pawn(Piece.WHITE, chess).place(4, 1);

        chess.turn = false;

        new Pawn(Piece.BLACK, chess).place(6, 0).
            move(4, 0);

        chess.nextTurn();

        assert.isTrue(p.getAvailableMoves().
            some(function (m) { return m.r === 5 && m.c === 0; }));

        p.move(5, 0);

        assert.isTrue(board.isEmpty(4, 0));
        assert.areSame(p, board.pieceAt(5, 0));
    }).

    clause("white pawn should be able to perform en passant to the right",
    function () {
        var p = new Pawn(Piece.WHITE, chess).place(4, 1);

        chess.turn = false;

        new Pawn(Piece.BLACK, chess).place(6, 2).
            move(4, 2);

        chess.nextTurn();

        assert.isTrue(p.getAvailableMoves().
            some(function (m) { return m.r === 5 && m.c === 2; }));

        p.move(5, 2);

        assert.isTrue(board.isEmpty(4, 2));
        assert.areSame(p, board.pieceAt(5, 2));
    }).

    clause("black pawn should be able to perform en passant to the left",
    function () {
        var p = new Pawn(Piece.BLACK, chess).place(3, 1);

        new Pawn(Piece.WHITE, chess).place(1, 0).
            move(3, 0);

        chess.nextTurn();

        assert.isTrue(p.getAvailableMoves().
            some(function (m) { return m.r === 2 && m.c === 0; }));

        p.move(2, 0);

        assert.isTrue(board.isEmpty(3, 0));
        assert.areSame(p, board.pieceAt(2, 0));
    }).

    clause("black pawn should be able to perform en passant to the right",
    function () {
        var p = new Pawn(Piece.BLACK, chess).place(3, 1);

        new Pawn(Piece.WHITE, chess).place(1, 2).
            move(3, 2);

        chess.nextTurn();

        assert.isTrue(p.getAvailableMoves().
            some(function (m) { return m.r === 2 && m.c === 2; }));

        p.move(2, 2);

        assert.isTrue(board.isEmpty(3, 2));
        assert.areSame(p, board.pieceAt(2, 2));
    }).

    clause(
    "en passant should only be allowed just after the opposing pawn has just " +
    "been moved",
    function () {
        var p = new Pawn(Piece.BLACK, chess).place(3, 1);
        new Pawn(Piece.BLACK, chess).place(6, 7);
        new Pawn(Piece.WHITE, chess).place(1, 2);
        new Pawn(Piece.WHITE, chess).place(1, 7);

        board.pieceAt(1, 2).move(3, 2);
        chess.nextTurn();

        board.pieceAt(6, 7).move(5, 7);
        chess.nextTurn();

        board.pieceAt(1, 7).move(2, 7);
        chess.nextTurn();

        p.getAvailableMoves().forEach(function (m) {
            assert.isFalse(m.r === 2 && m.c === 2);
        });
    }).

    clause("white pawn should be able to capture forward diagonals only",
    function () {
        var p = new Pawn(Piece.WHITE, chess).place(1, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r !== 1 || c !== 4) {
                    new Pawn(Piece.BLACK, chess).place(r, c);
                }
            }
        }

        var moves = p.getAvailableMoves();
        assert.areSame(2, moves.length);
        assert.isTrue(moves.some(function (m) {
            return m.r === 2 && m.c === 3; }));

        assert.isTrue(moves.some(function (m) {
            return m.r === 2 && m.c === 5; }));
    }).

    clause("black pawn should be able to capture forward diagonals only",
    function () {
        var p = new Pawn(Piece.BLACK, chess).place(6, 4);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r !== 6 || c !== 4) {
                    new Pawn(Piece.WHITE, chess).place(r, c);
                }
            }
        }

        var moves = p.getAvailableMoves();
        assert.areSame(2, moves.length);
        assert.isTrue(moves.some(function (m) {
            return m.r === 5 && m.c === 3; }));

        assert.isTrue(moves.some(function (m) {
            return m.r === 5 && m.c === 5; }));
    }).

    clause("white pawn should be able to promote upon reaching the 8th rank",
    function () {
        var p = new Pawn(Piece.WHITE, chess).place(6, 0);
        p.promote(0, Knight);

        var n = board.pieceAt(7, 0);
        assert.isTrue(n.white);
        assert.isTrue(n.hasMoved);
        assert.areSame(7, n.r);
        assert.areSame(0, n.c);
        assert.areSame(chess, n.chess);
    }).

    clause("black pawn should be able to promote upon reaching the 8th rank",
    function () {
        chess.turn = false;

        var p = new Pawn(Piece.BLACK, chess).place(1, 0);
        p.promote(0, Knight);

        var n = board.pieceAt(0, 0);
        assert.isFalse(n.white);
        assert.isTrue(n.hasMoved);
        assert.areSame(0, n.r);
        assert.areSame(0, n.c);
        assert.areSame(chess, n.chess);
    }).

    clause("pawn should be able to promote to a knight", function () {
        var p = new Pawn(Piece.WHITE, chess).place(6, 0);
        p.promote(0, Knight);

        var n = board.pieceAt(7, 0);
        assert.isTrue(n.white);
        assert.isTrue(n.hasMoved);
        assert.areSame(7, n.r);
        assert.areSame(0, n.c);
        assert.isInstanceOf(n, Knight);
    }).

    clause("pawn should be able to promote to a bishop", function () {
        var p = new Pawn(Piece.WHITE, chess).place(6, 0);
        p.promote(0, Bishop);

        var n = board.pieceAt(7, 0);
        assert.isTrue(n.white);
        assert.isTrue(n.hasMoved);
        assert.areSame(7, n.r);
        assert.areSame(0, n.c);
        assert.isInstanceOf(n, Bishop);
    }).

    clause("pawn should be able to promote to a rook", function () {
        var p = new Pawn(Piece.WHITE, chess).place(6, 0);
        p.promote(0, Rook);

        var n = board.pieceAt(7, 0);
        assert.isTrue(n.white);
        assert.isTrue(n.hasMoved);
        assert.areSame(7, n.r);
        assert.areSame(0, n.c);
        assert.isInstanceOf(n, Rook);
    }).

    clause("pawn should be able to promote to a queen", function () {
        var p = new Pawn(Piece.WHITE, chess).place(6, 0);
        p.promote(0, Queen);

        var n = board.pieceAt(7, 0);
        assert.isTrue(n.white);
        assert.isTrue(n.hasMoved);
        assert.areSame(7, n.r);
        assert.areSame(0, n.c);
        assert.isInstanceOf(n, Queen);
    }).

    clause("pawn shouldn't be able to promote to a king", function () {
        var p = new Pawn(Piece.WHITE, chess).place(6, 0);
        try {
            p.promote(0, King);
        } catch (e) {
            assert.areSame("Invalid promotion", e.message);
        }
    }).

    clause("pawn shouldn't be able to promote to another pawn", function () {
        var p = new Pawn(Piece.WHITE, chess).place(6, 0);
        try {
            p.promote(0, Pawn);
        } catch (e) {
            assert.areSame("Invalid promotion", e.message);
        }
    });

}(typeof exports !== "undefined" && global.exports !== exports));
