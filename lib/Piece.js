(function (node) {
    "use strict";

    var Util = node? require("./Util"): window.chess.Util;

    /**
     * Represents a piece within the chess game. The base class for every other
     * piece.
     *
     * @class chess.Piece
     * @constructor
     *
     * @param {boolean} white
     * @param {chess.Chess} chess
     */
    var Piece = function (white, chess) {
        this.white = Boolean(white);
        this.hasMoved = false;
        this.chess = chess;
        this.r = undefined;
        this.c = undefined;
    };

    /**
     * Boolean `true` that represents a white piece
     *
     * @static
     * @property WHITE
     * @type {boolean}
     */
    Piece.WHITE = true;

    /**
     * Boolean `false` that represents a black piece
     *
     * @static
     * @property BLACK
     * @type {boolean}
     */
    Piece.BLACK = false;

    var fan;
    var toFile;
    var toRank;
    var getEquallyMovingPieces;

    Util.merge(Piece.prototype, {

        /**
         * Perform a move for the piece given the row and column
         *
         * @method move
         * @for chess.Piece
         *
         * @param {integer} r The row
         * @param {integer} c The column
         */
        move: function (r, c) {
            var chess = this.chess;
            var board = chess.board;

            if (chess.turn !== this.white) {
                throw new Error("Invalid move");
            }

            if (!this.getAvailableMoves().
                    some(function (m) { return m.r === r && m.c === c; })) {

                throw new Error("Invalid move");
            }

            chess.moves.push({
                fan: fan.call(this, r, c),
                piece: this,
                from: { r: this.r, c: this.c },
                to: { r: r, c: c },
                type: board.isEmpty(r, c)? "move": "capture"
            });

            board.remove(this.r, this.c);
            this.place(r, c);
            this.hasMoved = true;

            return this;
        },

        /**
         * Places the piece within the board
         *
         * @method place
         * @for chess.Piece
         *
         * @param {integer} r The row
         * @param {integer} c The column
         */
        place: function (r, c) {
            this.remove();
            this.chess.board.place(r, c, this);
            Util.merge(this, { r: r, c: c });

            return this;
        },

        /**
         * Removes the piece from the board
         *
         * @method remove
         * @for chess.Piece
         */
        remove: function () {
            if (this.r !== undefined) {
                this.chess.board.remove(this.r, this.c);
                Util.merge(this, { r: undefined, c: undefined });
            }

            return this;
        },

        /**
         * Informs if the piece threatens another piece.
         *
         * @method threatens
         * @for chess.Piece
         *
         * @param {chess.Piece} p Another piece
         * @return {boolean}
         */

        /**
         * Informs if the piece threatens a given place.
         *
         * @method threatens
         * @for chess.Piece
         *
         * @param {integer} r The row
         * @param {integer} c The column
         * @return {boolean}
         */
        threatens: function (r, c) {
            if (r instanceof Piece) {
                c = r.c;
                r = r.r;
            }

            return this.threatensSquare(r, c);
        },

        /**
         * Returns a list of available places to move.
         *
         * @method getAvailableMoves
         * @for chess.Piece
         *
         * @return {chess.Place[]}
         */
        getAvailableMoves: function () {
            var r = this.r;
            var c = this.c;
            var p = this;
            var chess = this.chess;
            var board = chess.board;
            var moves = this.getMoves().filter(function (m) {
                var destPiece = board.pieceAt(m.r, m.c);
                p.place(m.r, m.c);

                var notInCheck = !chess.inCheck(p.white);

                p.place(r, c);
                if (destPiece) {
                    destPiece.place(m.r, m.c);
                }

                return notInCheck;
            });

            this.place(r, c);

            return moves;
        },

        /**
         * Informs if the piece threatens a given square. Should be implemented
         * by it's subclasses.
         *
         * @method threatensSquare
         * @for chess.Piece
         *
         * @param {integer} r The row
         * @param {integer} c The column
         * @return {boolean}
         */
        threatensSquare: function (r, c) {
            throw new Error("Unimplemented method");
        },

        /**
         * Returns the list of moves the piece can make. Should be implemented
         * by it's subclasses.
         *
         * @method getMoves
         * @for chess.Piece
         *
         * @return {chess.Place[]}
         */
        getMoves: function () {
            throw new Error("Unimplemented method");
        }
    });

    fan = function (r, c) {
        var chess = this.chess;
        var board = chess.board;
        var white = this.white;
        var piece;
        var prevR;
        var prevC;
        var fan;

        if (chess.turn !== white) {
            throw new Error("Invalid move");
        }

        if (!this.getAvailableMoves().
                some(function (m) { return m.r === r && m.c === c; })) {

            throw new Error("Invalid move");
        }

        fan = this.toString();

        var emp = getEquallyMovingPieces.call(this, r, c);
        if (emp.length === 1) {
            fan += (emp[0].r === this.r? toFile(this.c): toRank(this.r));
        } else if (emp.length > 1) {
            fan += toFile(this.c) + toRank(this.r);
        }

        piece = board.pieceAt(r, c);
        if (piece !== undefined) {
            fan += "x";
        }

        fan += toFile(c) + toRank(r);

        prevR = this.r;
        prevC = this.c;

        this.place(r, c);
        if (chess.inCheckMate(!white)) {
            fan += "#";
        } else if (chess.inCheck(!white)) {
            fan += "+";
        }

        this.place(prevR, prevC);
        if (piece !== undefined) {
            piece.place(r, c);
        }

        return fan;
    };

    toFile = function (c) {
        return "abcdefgh".charAt(c);
    };

    toRank = function (r) {
        return r + 1;
    };

    getEquallyMovingPieces = function (mr, mc) {
        var pieces = [];
        var board = this.chess.board;
        var white = this.white;
        var piece;
        var r, c;

        var hasMove = function (m) {
            return mr === m.r && mc === m.c;
        };

        for (r = 0; r < 8; r += 1) {
            for (c = 0; c < 8; c += 1) {
                piece = board.pieceAt(r, c);
                if (piece &&
                        piece !== this &&
                        piece.white === white &&
                        this.constructor === piece.constructor &&
                        piece.getAvailableMoves().some(hasMove)) {

                    pieces.push(piece);
                }
            }
        }

        return pieces;
    };

    if (node) {
        module.exports = Piece;
    } else {
        window.chess.Piece = Piece;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
