(function (node) {
    "use strict";

    var Util = node? require("./Util"): window.chess.Util;

    /**
     * Represents the chess board.
     *
     * @class chess.Board
     * @constructor
     */
    var Board = function () {
        var s, r, c;

        this.squares = [];

        for (r = 0; r < 8; r += 1) {
            s = [];

            for (c = 0; c < 8; c += 1) {
                s.push(undefined);
            }

            this.squares.push(s);
        }
    };

    Util.merge(Board.prototype, {

        /**
         * Returns the piece at a given place
         *
         * @method pieceAt
         * @for chess.Board
         *
         * @param {integer} r The row
         * @param {integer} c The column
         * @return {chess.Piece}
         */
        pieceAt: function (r, c) {
            return this.squares[r][c];
        },

        /**
         * Indicates if a given place is empty
         *
         * @method isEmpty
         * @for chess.Board
         *
         * @param {integer} r The row
         * @param {integer} c The column
         * @return {boolean}
         */
        isEmpty: function (r, c) {
            return !this.pieceAt(r, c);
        },

        /**
         * Place a piece into the desired place
         *
         * @method place
         * @for chess.Board
         *
         * @param {integer} r The row
         * @param {integer} c The column
         * @param {chess.Piece} p The piece
         */
        place: function (r, c, p) {
            this.squares[r][c] = p;
        },

        /**
         * Removes a piece from the board
         *
         * @method remove
         * @for chess.Board
         *
         * @param {integer} r The row
         * @param {integer} c The column
         */
        remove: function (r, c) {
            this.place(r, c);
        },

        toString: function () {
            var s = "";
            for (var r = 7; r > -1; r -= 1) {
                for (var c = 0; c < 8; c += 1) {
                    s += this.isEmpty(r, c)? ".": this.pieceAt(r, c);
                }
                s += "\n";
            }

            return s;
        }

    });

    if (node) {
        module.exports = Board;
    } else {
        window.chess.Board = Board;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
