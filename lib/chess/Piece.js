(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = function (white, chess) {
        this.white = Boolean(white);
        this.hasMoved = false;
        this.chess = chess;
        this.r = undefined;
        this.c = undefined;
    };

    Util.merge(Piece.prototype, {
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

        place: function (r, c) {
            this.remove();
            this.chess.board.place(r, c, this);
            Util.merge(this, { r: r, c: c });

            return this;
        },

        remove: function () {
            if (this.r !== undefined) {
                this.chess.board.remove(this.r, this.c);
                Util.merge(this, { r: undefined, c: undefined });
            }

            return this;
        },

        threatens: function (r, c) {
            if (r instanceof Piece) {
                c = r.c;
                r = r.r;
            }

            return this.threatensSquare(r, c);
        },

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

        threatensSquare: function (r, c) {
            throw new Error("Unimplemented method");
        },

        getMoves: function () {
            throw new Error("Unimplemented method");
        }
    });

    var fan = function (r, c) {
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

    var toFile = function (c) {
        return "abcdefgh".charAt(c);
    };

    var toRank = function (r) {
        return r + 1;
    };

    var getEquallyMovingPieces = function (mr, mc) {
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
        window.chess.chess_Piece = Piece;
    }

}(typeof exports !== "undefined" && global.exports !== exports));