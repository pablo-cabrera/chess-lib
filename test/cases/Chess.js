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
    var Piece = lib.Piece;
    var Pawn = lib.Pawn;
    var Rook = lib.Rook;
    var Knight = lib.Knight;
    var Bishop = lib.Bishop;
    var Queen = lib.Queen;
    var King = lib.King;

    var chess;
    var board;

    gabarito.

    test("chess/Chess").

    before(function () {
        chess = new Chess();
        board = chess.board;
    }).

    clause(
    "reset should create a new board, set the starting position, set the " +
    "turn to white and reset all moves",
    function () {
        chess.reset();

        var b = chess.board;

        assert.areNotSame(board, chess.board);
        assert.areSame(chess.turn, Piece.WHITE);
        assert.areSame(0, chess.moves.length);

        var assertPiece = function (r, c, t, w) {
            var p =  b.pieceAt(r, c);
            assert.isInstanceOf(p, t);
            assert.areSame(w, p.white);
            assert.isFalse(p.hasMoved);
            assert.areSame(r, p.r);
            assert.areSame(c, p.c);
        };

        for (var i = 0; i < 8; i += 1) {
            assertPiece(6, i, Pawn, Piece.BLACK);
            assertPiece(1, i, Pawn, Piece.WHITE);

            assert.isTrue(b.isEmpty(2, i));
            assert.isTrue(b.isEmpty(3, i));
            assert.isTrue(b.isEmpty(4, i));
            assert.isTrue(b.isEmpty(5, i));
        }

        [0, 7].forEach(function (c) {
            assertPiece(0, c, Rook, Piece.WHITE);
            assertPiece(7, c, Rook, Piece.BLACK);
        });

        [1, 6].forEach(function (c) {
            assertPiece(0, c, Knight, Piece.WHITE);
            assertPiece(7, c, Knight, Piece.BLACK);
        });

        [2, 5].forEach(function (c) {
            assertPiece(0, c, Bishop, Piece.WHITE);
            assertPiece(7, c, Bishop, Piece.BLACK);
        });

        [0, 7].forEach(function (r) {
            assertPiece(r, 3, Queen, r === 0);
            assertPiece(r, 4, King, r === 0);
        });

        assert.areSame(b.pieceAt(0, 4), chess.whiteKing);
        assert.areSame(b.pieceAt(7, 4), chess.blackKing);
    }).

    clause(
    "should tell that there is no king in check if there are no kings on " +
    "the board",
    function () {
        assert.isFalse(chess.inCheck(Piece.WHITE));
        assert.isFalse(chess.inCheck(Piece.BLACK));
    }).

    clause(
    "should tell that white is in check if a black piece threatens the white " +
    "king",
    function () {
        new Rook(Piece.BLACK, chess).place(1, 0);
        chess.whiteKing = new King(Piece.WHITE, chess).place(0, 0);

        assert.isTrue(chess.inCheck(Piece.WHITE));
    }).

    clause(
    "should tell that black is in check if a white piece threatens the " +
    "black king", function () {
        new Rook(Piece.WHITE, chess).place(1, 0);
        chess.blackKing = new King(Piece.BLACK, chess).place(0, 0);

        assert.isTrue(chess.inCheck(Piece.BLACK));
    }).

    clause(
    "should tell that there is no king in check mate if there are no kings " +
    "on the board",
    function () {
        assert.isFalse(chess.inCheckMate(Piece.WHITE));
        assert.isFalse(chess.inCheckMate(Piece.BLACK));
    }).

    clause(
    "should tell that white king is in check mate if it is in check and " +
    "there are no more available moves",
    function () {
        new Rook(Piece.BLACK, chess).place(0, 7);
        new Rook(Piece.BLACK, chess).place(1, 7);

        chess.whiteKing = new King(Piece.WHITE, chess).place(0, 0);

        assert.isTrue(chess.inCheckMate(Piece.WHITE));
    }).

    clause(
    "should tell that black king is in check mate if it is in check and " +
    "there are no more available moves",
    function () {
        new Rook(Piece.WHITE, chess).place(0, 7);
        new Rook(Piece.WHITE, chess).place(1, 7);

        chess.blackKing = new King(Piece.BLACK, chess).place(0, 0);

        assert.isTrue(chess.inCheckMate(Piece.BLACK));
    }).

    clause(
    "should not tell that the white king is in check mate if the king is in " +
    "check, there are no available moves for the king, but the threatening " +
    "piece could be taken down",
    function () {
        new Rook(Piece.BLACK, chess).place(0, 7);
        new Rook(Piece.BLACK, chess).place(1, 7);

        new Bishop(Piece.WHITE, chess).place(2, 5);

        chess.whiteKing = new King(Piece.WHITE, chess).place(0, 0);

        assert.isFalse(chess.inCheckMate(Piece.WHITE));
    }).

    clause("nextTurn should switch the turn", function () {
        assert.areSame(chess.turn, Piece.WHITE);
        chess.nextTurn();
        assert.areSame(chess.turn, Piece.BLACK);
    }).

    clause(
    "should tell that there is a stalemate if there are no moves available " +
    "to the current player",
    function () {
        chess.whiteKing = new King(Piece.WHITE, chess).place(0, 0);
        chess.whiteKing.hasMoved = true;

        new Rook(Piece.BLACK, chess).place(1, 1);
        new Rook(Piece.BLACK, chess).place(2, 1);

        assert.isTrue(chess.isStalemate());
    }).

    clause(
    "should tell that there is no stalemate if there are no moves available " +
    "to the current player but it is in check",
    function () {
        chess.whiteKing = new King(Piece.WHITE, chess).place(0, 0);
        chess.whiteKing.hasMoved = true;

        new Rook(Piece.BLACK, chess).place(1, 1);
        new Rook(Piece.BLACK, chess).place(2, 1);
        new Rook(Piece.BLACK, chess).place(1, 0);

        assert.isFalse(chess.isStalemate());
    });

}(typeof exports !== "undefined" && global.exports !== exports));
