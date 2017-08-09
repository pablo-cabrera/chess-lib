(function (node) {
    "use strict";

    var Util = node? require("./Util"): window.chess.Util;

    var Piece = Util.dependency("Piece");
    var Rook = Util.dependency("Rook");
    var Knight = Util.dependency("Knight");
    var Bishop = Util.dependency("Bishop");
    var Queen = Util.dependency("Queen");

    var enPassant;

    /**
     * Represents a pawn within the chess game.
     *
     * @class chess.Pawn
     * @extends chess.Piece
     * @constructor
     *
     * @param {boolean} white
     * @param {chess.Chess} chess
     */
    var Pawn = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Pawn, Piece);

    Util.merge(Pawn.prototype, {

        getMoves: function () {
            var board = this.chess.board;
            var moves = [];
            var w = this.white;
            var r = this.r;
            var c = this.c;
            var fwd = w? 1: -1;
            var p, m;
            var that = this;

            r += fwd;

            // forward square
            if (board.isEmpty(r, c)) {
                moves.push({ r: r, c: c });
            }

            // forward diagonal squares
            [c + 1, c - 1].forEach(function (c) {
                p = board.pieceAt(r, c);
                if (p && p.white !== w) {
                    moves.push({ r: r, c: c });
                }
            }, this);


            p = enPassant.call(this);
            if (p) {
                moves.push({ r: r, c: p.c });
            }

            // 2nd forward square
            if (!this.hasMoved) {
                r += fwd;
                if (r > -1 && r < 8 && board.isEmpty(r, c)) {
                    moves.push({ r: r, c: c });
                }
            }

            return moves;
        },

        move: function (r, c) {
            var lastMove;
            var fan;
            var pawn = enPassant.call(this);
            var chess = this.chess;
            var black;

            Piece.prototype.move.call(this, r, c);
            lastMove = chess.lastMove();
            fan = lastMove.fan.substr(1);

            if (pawn && c === pawn.c) {
                black = !this.white;

                lastMove.type = "en passant";
                fan = fan.replace(/\+|\#/, "");
                fan = fan.substr(0, fan.length - 2) + "x" + fan.substr(-2);

                pawn.remove();

                if (chess.inCheckMate(black)) {
                    fan += "#";
                } else if (chess.inCheck(black)) {
                    fan += "+";
                }
            }

            lastMove.fan = fan;
        },

        threatensSquare: function (r, c) {
            return Math.abs(c - this.c) === 1 &&
                this.r + (this.white? 1: -1) === r;
        },

        /**
         * Promotes a pawn into another desired piece, being either Rook, Knight
         * Bishop or Queen.
         *
         * @method promote
         * @for chess.Pawn
         *
         * @param {integer} c The pawn's column
         * @param {function} T The piece type
         */
        promote: function (c, T) {
            var white, chess, p, lastMove, fan;

            if ([Rook, Knight, Bishop, Queen].indexOf(T) === -1) {
                throw new Error("Invalid promotion");
            }

            white = this.white;
            chess = this.chess;

            this.move(white? 7: 0, c);

            p = new T(white, chess);
            p.hasMoved = true;
            p.place(this.r, this.c);

            lastMove = chess.lastMove();
            fan = lastMove.fan.replace(/\+|#/, "");
            fan += "=" + p.toString();

            if (chess.inCheckMate(!white)) {
                fan += "#";
            } else if (chess.inCheck(!white)) {
                fan += "+";
            }

            Util.merge(lastMove, {
                type: "promotion",
                promotion: p,
                fan: fan
            });
        },

        toString: function () {
            return this.white? "\u2659": "\u265F";
        }
    });

    enPassant = function () {
        var chess = this.chess;
        var moves = chess.moves;
        var fifth = this.white? 4: 3;
        var m;

        if (this.r === fifth && moves.length !== 0) {
            m = chess.lastMove();
            if (m.piece instanceof Pawn &&
                    Math.abs(m.from.r - m.to.r) === 2 &&
                    Math.abs(m.to.c - this.c) === 1 &&
                    m.to.r === fifth) {

                return m.piece;
            }
        }
    };

    if (node) {
        module.exports = Pawn;
    } else {
        window.chess.Pawn = Pawn;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
