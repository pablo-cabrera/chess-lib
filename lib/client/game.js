window.chess = {};
(function (node) {
    "use strict";

    var Util = {

        extend: function (subClass, superClass) {
            var F = function () {};
            F.prototype = superClass.prototype;
            subClass.prototype = new F();
            subClass.prototype.constructor = subClass;
        },

        merge: function (a, b) {
            for (var p in b) {
                if (b.hasOwnProperty(p)) {
                    a[p] = b[p];
                }
            }
        },

        dependency: function (d) {
            return node?
                require(process.cwd() + "/lib/" + d):
                window.chess[d.replace(/\//g, "_")];
        }

    };

    if (node) {
        module.exports = Util;
    } else {
        window.chess.util_Util = Util;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
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

            board.remove(this.r, this.c);
            chess.moves.push({
                piece: this,
                from: { r: this.r, c: this.c },
                to: { r: r, c: c },
                type: board.isEmpty(r, c)? "move": "capture"

            });

            this.place(r, c);
            this.hasMoved = true;

            chess.nextTurn();

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

    if (node) {
        module.exports = Piece;
    } else {
        window.chess.chess_Piece = Piece;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

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
                if (board.isEmpty(r, c)) {
                    moves.push({ r: r, c: c });
                }
            }

            return moves;
        },

        move: function (r, c) {
            var p = enPassant.call(this);
            Piece.prototype.move.call(this, r, c);
            if (p && c === p.c) {
                this.chess.moves[this.chess.moves.length - 1].type = "en passant";
                p.remove();
            }
        },

        threatensSquare: function (r, c) {
            return Math.abs(c - this.c) === 1 &&
                this.r + (this.white? 1: -1) === r;
        },

        toString: function () {
            return this.white? "\u2659": "\u265F";
        }
    });

    var enPassant = function () {
        var moves = this.chess.moves;
        var fifth = this.white? 4: 3;
        var m;

        if (this.r === fifth && moves.length !== 0) {
            m = moves[moves.length - 1];
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
        window.chess.chess_Pawn = Pawn;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

    var Knight = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Knight, Piece);

    Util.merge(Knight.prototype, {

        getMoves: function () {
            var board = this.chess.board;
            var r = this.r;
            var c = this.c;
            var w = this.white;

            var isInside = function (i) {
                return i > -1 && i < 8;
            };

            return [
                { r: r - 2, c: c - 1 },
                { r: r - 1, c: c - 2 },
                { r: r + 1, c: c - 2 },
                { r: r + 2, c: c - 1 },
                { r: r - 2, c: c + 1 },
                { r: r - 1, c: c + 2 },
                { r: r + 1, c: c + 2 },
                { r: r + 2, c: c + 1 }
            ].filter(function (m) {
                if (!isInside(m.r) || !isInside(m.c)) {
                    return false;
                }

                var p = board.pieceAt(m.r, m.c);
                return !p || p.white !== w;
            });
        },

        threatensSquare: function (r, c) {
            return Math.pow(r - this.r, 2) + Math.pow(c - this.c, 2) === 5;
        },

        toString: function () {
            return this.white? "\u2658": "\u265E";
        }
    });

    if (node) {
        module.exports = Knight;
    } else {
        window.chess.chess_Knight = Knight;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

    var Rook = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Rook, Piece);

    Util.merge(Rook.prototype, {

        getMoves: function () {
            var board = this.chess.board;
            var moves = [];
            var r = this.r;
            var c = this.c;
            var w = this.white;
            var nr, nc;

            var probe = function (r, c) {
                var p = board.pieceAt(r, c);
                if (!p || p.white !== w) {
                    moves.push({ r: r, c: c });
                }

                return Boolean(p);
            };

            for (nr = r + 1; nr < 8; nr += 1) {
                if (probe(nr, c)) {
                    break;
                }
            }

            for (nr = r - 1; nr > -1 ; nr -= 1) {
                if (probe(nr, c)) {
                    break;
                }
            }

            for (nc = c + 1; nc < 8; nc += 1) {
                if (probe(r, nc)) {
                    break;
                }
            }

            for (nc = c - 1; nc > -1; nc -= 1) {
                if (probe(r, nc)) {
                    break;
                }
            }

            return moves;
        },

        threatensSquare: function (r, c) {
            var i, p;
            var board = this.chess.board;

            if (r === this.r && c === this.c) {
                return false;
            } else if (r === this.r) {
                i = c < this.c? 1: -1;

                c += i;
                while (c !== this.c) {
                    if (!board.isEmpty(r, c)) {
                        return false;
                    }
                    c += i;
                }

                return true;
            } else if (c === this.c) {
                i = r < this.r? 1: -1;

                r += i;
                while (r !== this.r) {
                    if (!board.isEmpty(r, c)) {
                        return false;
                    }
                    r += i;
                }

                return true;
            }

            return false;
        },

        toString: function () {
            return this.white? "\u2656": "\u265C";
        }

    });

    if (node) {
        module.exports = Rook;
    } else {
        window.chess.chess_Rook = Rook;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function(node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

    var Bishop = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Bishop, Piece);

    Util.merge(Bishop.prototype, {

        getMoves: function () {
            var board = this.chess.board;
            var moves = [];
            var r = this.r;
            var c = this.c;
            var w = this.white;
            var nr, nc;

            var probe = function (r, c) {
                var p = board.pieceAt(r, c);
                if (!p || p.white !== w) {
                    moves.push({ r: r, c: c });
                }

                return Boolean(p);
            };

            for (nr = r + 1, nc = c + 1; nr < 8 && nc < 8; nr += 1, nc += 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            for (nr = r + 1, nc = c - 1; nr < 8 && nc > -1; nr += 1, nc -= 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            for (nr = r - 1, nc = c - 1; nr > -1 && nc > -1; nr -= 1, nc -= 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            for (nr = r - 1, nc = c + 1; nr > -1 && nc < 8; nr -= 1, nc += 1) {
                if (probe(nr, nc)) {
                    break;
                }
            }

            return moves;
        },

        threatensSquare: function (r, c) {
            var ir, ic, board;


            if (r === this.r && c === this.c ||
                    Math.abs(this.r - r) !== Math.abs(this.c - c)) {

                return false;
            }

            board = this.chess.board;

            ir = r < this.r? 1: -1;
            ic = c < this.c? 1: -1;

            r += ir;
            c += ic;

            while (r !== this.r) {
                if (!board.isEmpty(r, c)) {
                    return false;
                }

                r += ir;
                c += ic;
            }

            return true;
        },

        toString: function () {
            return this.white? "\u2657": "\u265D";
        }

    });

    if (node) {
        module.exports = Bishop;
    } else {
        window.chess.chess_Bishop = Bishop;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");
    var Bishop = Util.dependency("chess/Bishop");
    var Rook = Util.dependency("chess/Rook");

    var Queen = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(Queen, Piece);

    Util.merge(Queen.prototype, {

        getMoves: function () {
            return Bishop.prototype.getMoves.call(this).
                    concat(Rook.prototype.getMoves.call(this));
        },

        threatensSquare: function (r, c) {
            return Bishop.prototype.threatensSquare.call(this, r, c) ||
                    Rook.prototype.threatensSquare.call(this, r, c);
        },

        toString: function () {
            return this.white? "\u2655": "\u265B";
        }

    });

    if (node) {
        module.exports = Queen;
    } else {
        window.chess.chess_Queen = Queen;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Piece = Util.dependency("chess/Piece");

    var King = function (white, chess) {
        Piece.call(this, white, chess);
    };

    Util.extend(King, Piece);

    Util.merge(King.prototype, {

        getMoves: function () {
            var r = this.r;
            var c = this.c;
            var w = this.white;

            var chess = this.chess;
            var board = chess.board;

            var moves = [
                { r: r + 1, c: c - 1 },
                { r: r + 1, c: c },
                { r: r + 1, c: c + 1 },
                { r: r, c: c - 1 },
                { r: r, c: c + 1 },
                { r: r - 1, c: c - 1 },
                { r: r - 1, c: c },
                { r: r - 1, c: c + 1 }
            ].filter(function (m) {
                if (m.r < 0 || m.c < 0 || m.r > 7 || m.c > 7) {
                    return false;
                }

                var p = board.pieceAt(m.r, m.c);
                return !p || p.white !== w;
            });

            if (this.canCastleLeft()) {
                moves.push({ r: r, c: c - 2 });
            }

            if (this.canCastleRight()) {
                moves.push({ r: r, c: c + 2 });
            }

            return moves;
        },

        canCastleLeft: function () {
            var w = this.white;
            var r = this.r;
            var c = this.c;

            var chess = this.chess;
            var board = chess.board;

            if (this.hasMoved || chess.inCheck(w)) {
                return false;
            }

            var rook = board.pieceAt(r, 0);
            if (!rook || rook.hasMoved) {
                return false;
            }

            if ([1, 2, 3].some(function (c) { return !board.isEmpty(r, c); })) {
                return false;
            }

            try {
                this.place(r, c - 1);
                if (chess.inCheck(w)) {
                    return false;
                }

                this.place(r, c - 2);
                return !chess.inCheck(w);
            } finally {
                this.place(r, c);
            }
        },

        canCastleRight: function () {
            var w = this.white;
            var r = this.r;
            var c = this.c;

            var chess = this.chess;
            var board = chess.board;

            if (this.hasMoved || chess.inCheck(w)) {
                return false;
            }

            var rook = board.pieceAt(r, 7);
            if (!rook || rook.hasMoved) {
                return false;
            }

            if ([5, 6].some(function (c) { return !board.isEmpty(r, c); })) {
                return false;
            }

            try {
                this.place(r, c + 1);
                if (chess.inCheck(w)) {
                    return false;
                }

                this.place(r, c + 2);

                return !chess.inCheck(w);

            } finally {
                this.place(r, c);
            }
        },

        move: function (r, c) {
            var chess, board;

            var diff = this.c - c;

            Piece.prototype.move.call(this, r, c);

            if (Math.abs(diff) === 2) {
                chess = this.chess;
                board = chess.board;

                chess.moves[chess.moves.length - 1].type = "castling";

                if (diff > 0) {
                    board.
                        pieceAt(r, 0).
                        place(r, c + 1);
                } else {
                    board.
                        pieceAt(r, 7).
                        place(r, c - 1);
                }
            }
        },

        threatensSquare: function (r, c) {
            return !(r === this.r && c === this.c) &&
                Math.abs(r - this.r) < 2 && Math.abs(c - this.c) < 2;
        },

        toString: function () {
            return this.white? "\u2654": "\u265A";
        }

    });

    var withinBoard = function (i) {
    };

    if (node) {
        module.exports = King;
    } else {
        window.chess.chess_King = King;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Board = function () {
        var s;

        this.squares = [];

        for (var r = 0; r < 8; r += 1) {
            s = [];

            for (var c = 0; c < 8; c += 1) {
                s.push(undefined);
            }

            this.squares.push(s);
        }
    };

    Util.merge(Board.prototype, {

        pieceAt: function (r, c) {
            return this.squares[r][c];
        },

        isEmpty: function (r, c) {
            return !this.pieceAt(r, c);
        },

        place: function (r, c, p) {
            this.squares[r][c] = p;
        },

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
        window.chess.chess_Board = Board;
    }

}(typeof exports !== "undefined" && global.exports !== exports));
(function (node) {
    "use strict";

    var Util = node?
        require(process.cwd() + "/lib/util/Util"):
        window.chess.util_Util;

    var Board = Util.dependency("chess/Board");
    var Pawn = Util.dependency("chess/Pawn");
    var Rook = Util.dependency("chess/Rook");
    var Knight = Util.dependency("chess/Knight");
    var Bishop = Util.dependency("chess/Bishop");
    var Queen = Util.dependency("chess/Queen");
    var King = Util.dependency("chess/King");

    var WHITE = true;
    var BLACK = !WHITE;

    var Chess = function () {
        this.turn = WHITE;
        this.board = new Board();
        this.moves = [];
        this.whiteKing = undefined;
        this.blackKing = undefined;
    };

    Util.merge(Chess.prototype, {

        reset: function () {
            this.board = new Board();

            for (var i = 0; i < 8; i += 1) {
                new Pawn(WHITE, this).place(1, i);
                new Pawn(BLACK, this).place(6, i);
            }

            new Rook(WHITE, this).place(0, 0);
            new Knight(WHITE, this).place(0, 1);
            new Bishop(WHITE, this).place(0, 2);
            new Queen(WHITE, this).place(0, 3);
            new Bishop(WHITE, this).place(0, 5);
            new Knight(WHITE, this).place(0, 6);
            new Rook(WHITE, this).place(0, 7);

            new Rook(BLACK, this).place(7, 0);
            new Knight(BLACK, this).place(7, 1);
            new Bishop(BLACK, this).place(7, 2);
            new Queen(BLACK, this).place(7, 3);
            new Bishop(BLACK, this).place(7, 5);
            new Knight(BLACK, this).place(7, 6);
            new Rook(BLACK, this).place(7, 7);

            this.whiteKing = new King(WHITE, this).place(0, 4);
            this.blackKing = new King(BLACK, this).place(7, 4);

            this.turn = WHITE;
            this.moves = [];
        },

        inCheck: function (w) {
            var r, c, p;
            var b = this.board;
            var k = w? this.whiteKing: this.blackKing;

            if (k) {
                for (r = 0; r < 8; r += 1) {
                    for (c = 0; c < 8; c += 1) {
                        p = b.pieceAt(r, c);
                        if (p) {
                            if (p && p.white !== w && p.threatens(k)) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        },

        inCheckMate: function (w) {
            var r, c, p, k, b, t;

            if (!this.inCheck(w)) {
                return false;
            }

            k = w? this.whiteKing: this.blackKing;

            if (k.getAvailableMoves().length !== 0) {
                return false;
            }

            b = this.board;

            t = false;
            for (r = 0; r < 8; r += 1) {
                for (c = 0; c < 8; c += 1) {
                    p = b.pieceAt(r, c);
                    if (p) {
                        if (p && p.white !== w && p.threatens(k)) {
                            if (t) {
                                return true;
                            } else {
                                t = true;
                            }
                        }
                    }
                }
            }

            for (r = 0; r < 8; r += 1) {
                for (c = 0; c < 8; c += 1) {
                    p = b.pieceAt(r, c);
                    if (p && p.white === w && preventCheck.call(this, p)) {
                        return false;
                    }
                }
            }

            return true;
        },

        nextTurn: function () {
            this.turn = !this.turn;
        }

    });

    var preventCheck = function (p) {
        var t = this;
        var b = t.board;
        var r = p.r;
        var c = p.c;

        var prevent = p.getAvailableMoves().some(function (m) {
            var destPiece = b.pieceAt(m.r, m.c);
            p.place(m.r, m.c);
            var prevent = !t.inCheck(p.white);
            if (destPiece) {
                destPiece.place(m.r, m.c);
            }

            return prevent;
        });

        p.place(r, c);

        return prevent;
    };

    if (node) {
        module.exports = Chess;
    } else {
        window.chess.chess_Chess = Chess;
    }

}(typeof exports !== "undefined" && global.exports !== exports));