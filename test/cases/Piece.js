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
    var Piece = lib.Piece;
    var King = lib.King;
    var Queen = lib.Queen;
    var Rook = lib.Rook;
    var Bishop = lib.Bishop;

    var chess;
    var board;
    var piece;

    gabarito.

    test("chess/Piece").

    before(function () {
        chess = new Chess();
        board = chess.board;
        piece = new Piece(Piece.WHITE, chess);

        piece.getMoves = function () {
            var moves = [];

            for (var r = 0; r < 8; r += 1) {
                for (var c = 0; c < 8; c += 1) {
                    if (r !== this.r || c !== chess) {
                        moves.push({ r: r, c: c });
                    }
                }
            }

            return moves;
        };
    }).

    clause("should move the piece from one position to another", function () {
        piece.
            place(0, 0).
            move(1, 0);

        for (var r = 0; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                if (r === 1 && c === 0) {
                    assert.areSame(piece, board.pieceAt(r, c));
                } else {
                    assert.isTrue(board.isEmpty(r, c));
                }
            }
        }
    }).

    clause("should allow only moves from the availableMoves", function () {
        piece.place(0, 0);
        piece.getMoves = function () { return []; };

        try {
            piece.move(1, 0);
        } catch (e) {
            assert.areSame("Invalid move", e.message);
        }
    }).

    clause("should log moves within the chess", function () {
        assert.areSame(0, chess.moves.length);

        var from = { r: 0, c: 0 };
        var to = { r: 1, c: 0 };

        piece.
            place(from.r, from.c).
            move(to.r, to.c);

        assert.areSame(1, chess.moves.length);

        var m = chess.moves[0];
        assert.areSame(piece, m.piece);
        assert.areSame(from.r, m.from.r);
        assert.areSame(from.c, m.from.c);
        assert.areSame(to.r, m.to.r);
        assert.areSame(to.c, m.to.c);
    }).

    clause("once a piece has been moved, it should be marked as hasMoved",
    function () {
        assert.isFalse(piece.hasMoved);

        piece.
            place(0, 0).
            move(1, 0);

        assert.isTrue(piece.hasMoved);
    }).

    clause("the piece should not be allowed to move if if is not it's turn",
    function () {
        chess.turn = Piece.BLACK;

        try {
            piece.place(0, 0).move(1, 0);
        } catch (e) {
            assert.areSame("Invalid move", e.message);
        }
    }).

    clause("when placed, the piece should update it's coordiates", function () {
        assert.isUndefined(piece.r);
        assert.isUndefined(piece.c);

        piece.place(1, 2);

        assert.areSame(1, piece.r);
        assert.areSame(2, piece.c);
    }).

    clause(
    "when removed, the piece should have it's coordinates set as undefined",
    function () {
        piece.place(1, 2);

        assert.areSame(1, piece.r);
        assert.areSame(2, piece.c);

        piece.remove();

        assert.isUndefined(piece.r);
        assert.isUndefined(piece.c);
    }).

    clause("should filter out moves that would put it's king in check",
    function () {
        chess.inCheck = function () {
            return piece.r === 0;
        };

        piece.place(0, 0);

        var moves = piece.getAvailableMoves();

        var hasMove = function (r, c) {
            return moves.some(function (m) {
                    return m.r === r && m.c === c; });
        };

        assert.areSame(56, moves.length);

        for (var r = 1; r < 8; r += 1) {
            for (var c = 0; c < 8; c += 1) {
                assert.isTrue(hasMove(r, c));
            }
        }
    }).

    clause("fan should start with the piece character", function () {
        piece.toString = function () {
            return "p";
        };

        piece.place(4, 4);
        piece.move(4, 5);

        assert.areSame("p", chess.lastMove().fan.charAt(0));
    }).

    clause("fan should state the file and rank that the piece is moving to",
    function () {
        piece.toString = function () {
            return "p";
        };

        piece.place(4, 4);
        piece.move(4, 5);

        var fan = chess.lastMove().fan;

        assert.areSame("f", fan.charAt(1));
        assert.areSame("5", fan.charAt(2));
    }).

    clause(
    "fan should state the file if there is another piece that may move to " +
    "the same position and is on the same rank",
    function () {
        piece.toString = function () {
            return "p";
        };

        var anotherPiece = new Piece(Piece.WHITE, chess);
        anotherPiece.place(4, 6);
        anotherPiece.getMoves = piece.getMoves;

        piece.place(4, 4);
        piece.move(4, 5);

        assert.areSame("pef5", chess.lastMove().fan);
    }).

    clause(
    "fan should state the rank if there is another piece that may move to" +
    " the same position and is on the same file",
    function () {
        piece.toString = function () {
            return "p";
        };

        var anotherPiece = new Piece(Piece.WHITE, chess);
        anotherPiece.place(5, 4);
        anotherPiece.getMoves = piece.getMoves;

        piece.place(4, 4);
        piece.move(4, 5);

        assert.areSame("p5f5", chess.lastMove().fan);
    }).

    clause(
    "fan should state the rank and file if there are 2 or more pieces that " +
    "can move to the same position",
    function () {
        piece.toString = function () {
            return "p";
        };

        var anotherPiece = new Piece(Piece.WHITE, chess);
        anotherPiece.place(5, 4);
        anotherPiece.getMoves = piece.getMoves;

        var yetAnotherPiece = new Piece(Piece.WHITE, chess);
        yetAnotherPiece.place(6, 4);
        yetAnotherPiece.getMoves = piece.getMoves;

        piece.place(4, 4);
        piece.move(4, 5);

        assert.areSame("pe5f5", chess.lastMove().fan);
    }).

    clause("fan should add + to the end if it renders in a check",
    function () {
        piece.toString = function () {
            return "p";
        };

        piece.threatensSquare = function (r, c) {
            return r === 0 && c === 0;
        };

        var k = new King(Piece.BLACK, chess);
        k.place(0, 0);

        chess.blackKing = k;

        piece.place(4, 4);
        piece.move(4, 5);

        assert.areSame("pf5+", chess.lastMove().fan);
    }).

    clause("fan should add # to the end if it renders in a check mate",
    function () {
        piece.toString = function () {
            return "p";
        };

        piece.threatensSquare = function (r, c) {
            return true;
        };

        var k = new King(Piece.BLACK, chess);
        k.place(0, 0);

        chess.blackKing = k;

        piece.place(4, 4);
        piece.move(4, 5);

        assert.areSame("pf5#", chess.lastMove().fan);
    });

}(typeof exports !== "undefined" && global.exports !== exports));
