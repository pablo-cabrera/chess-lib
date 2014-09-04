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
            var moves = this.getAvailableMoves();

            if (!moves.some(function (m) { return m.r === r && m.c === c; })) {
                throw new Error("Invalid move");
            }

            chess.board.remove(this.r, this.c);
            chess.moves.push({
                piece: this,
                from: { r: this.r, c: this.c },
                to: { r: r, c: c }
            });

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
            var moves = this.getMoves().filter(function (m) {
                p.place(m.r, m.c);
                return !chess.inCheck(p.white);
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

    if (node) {
        module.exports = Piece;
    } else {
        window.chess.chess_Piece = Piece;
    }

}(typeof exports !== "undefined" && global.exports !== exports));