(function () {
    "use strict";

    var chess = window.chess;
    var game;
    var white;
    var table;
    var body;

    var initialize = function () {
        acquireGame(function () {
            drawBoard();
            drawPieces();
            setupPieceCursors();
            attachEventHandlers();
        });
    };

    var drawBoard = function () {
        var html = "<table>";

        var w = true;

        var r;
        var i;

        if (white) {
            r = 7;
            i = -1;
        } else {
            r = 0;
            i = 1;
        }

        while(r > -1 && r < 8) {
            html += "<tr>";

            for (var c = 0; c < 8; c += 1) {
                html += "<td id=\"row_" + r + "_col_" + c + "\" " +
                        "class=\"" + (w? "white": "black") + "\">";

                w = !w;
            }

            w = !w;

            r += i;
        }

        body.innerHTML = html;
        table = body.querySelector("table");
    };

    var slice = function (a) {
        return Array.prototype.slice.call(a);
    };

    var removePieceCursors = function () {
        slice(table.querySelectorAll("div")).forEach(function (d) {
            d.style.cursor = "";
        });
    };

    var setupPieceCursors = function () {
        slice(table.querySelectorAll("div." + (white? "white": "black"))).
                forEach(function (p) {
                    p.style.cursor = "pointer";
                });
    };

    var attachEventHandlers = function () {
        document.querySelector("table").
                addEventListener("mousedown", handleMouseDown, false);
    };

    var handleMouseDown = function (e) {
        e.preventDefault();

        var t = e.target;
        var className = "piece " + (white? "white": "black");

        if (t.tagName === "DIV" && t.className === className) {
            startDrag(t, e);
        }
    };

    var startDrag = function (p, e) {
        var c = p.parentNode;
        c.removeChild(p);

        body.appendChild(p);
        p.style.position = "absolute";
        p.style.top = (e.clientY + body.scrollTop - p.clientHeight / 2) + "px";
        p.style.left = (e.clientX + body.scrollLeft - p.clientWidth / 2) + "px";

        var rc = cellRowCol(c);
        game.board.pieceAt(rc.r, rc.c).getAvailableMoves().
            forEach(function (m) {
                addClass(cellAt(m.r, m.c), "available");
            });

        var d = drag(p);
        body.addEventListener("mousemove", d, false);
        body.addEventListener("mouseup", drop(p, c, d), false);
    };

    var drag = function (p) {
        var w = p.clientWidth / 2;
        var h = p.clientHeight / 2;
        return function (e) {
            var offsetX = e.clientX - table.offsetLeft;
            var offsetY = e.clientY - table.offsetTop;
            var x = Math.floor(offsetX / 100) + 1;
            var y = Math.floor(offsetY / 100) + 1;

            var oldFocus = document.querySelector("td.focus");
            var newFocus = cellAtPosition(e);

            if (oldFocus !== newFocus) {
                if (oldFocus) {
                    removeClass(oldFocus, "focus");
                }

                if (newFocus) {
                    addClass(newFocus, "focus");
                }
            }

            p.style.top = (e.clientY + body.scrollTop - h) + "px";
            p.style.left = (e.clientX + body.scrollLeft - w) + "px";
        };
    };

    var drop = function (piece, from, drag) {
        var drop = function (e) {
            body.removeEventListener("mousemove", drag, false);
            body.removeEventListener("mouseup", drop, false);

            piece.style.position = "";
            piece.style.top = "";
            piece.style.left = "";

            body.removeChild(piece);

            var focus = table.querySelector("td.focus");
            if (focus) {
                removeClass(focus, "focus");
            }

            slice(table.querySelectorAll("td.available")).forEach(function (c) {
                removeClass(c, "available");
            });

            performMove(piece, from, cellAtPosition(e));
        };

        return drop;
    };

    var cellAtPosition = function (e) {
        var x = Math.floor((e.clientX + body.scrollLeft - table.offsetLeft) / 100) + 1;
        var y = Math.floor((e.clientY + body.scrollTop - table.offsetTop) / 100) + 1;

        return document.querySelector(
                "tr:nth-child(" + y + ") td:nth-child(" + x + ")");
    };

    var cellAt = function (r, c) {
        return table.querySelector("#row_" + r + "_col_" + c);
    };

    var performMove = function (piece, from, to) {
        if (!to) {
            return from.appendChild(piece);
        }
        var f = cellRowCol(from);
        var t = cellRowCol(to);

        try {
            var p = game.board.pieceAt(f.r, f.c);
            p.move(t.r, t.c);

            to.innerHTML = "";
            to.appendChild(piece);

            var m = game.moves[game.moves.length - 1];

            if (m.type === "castling") {
                adjustCastling();
            } else if (m.type === "en passant") {
                adjustEnPassant();
            }

            white = game.turn;
            removePieceCursors();
            setupPieceCursors();
        } catch (e) {
            from.appendChild(piece);
        }
    };

    var adjustEnPassant = function () {
        var rc = game.moves[game.moves.length - 2].to;
        var p = cellAt(rc.r, rc.c).querySelector("div");
        p.parentNode.removeChild(p);
    };

    var adjustCastling = function () {
        var m = game.moves[game.moves.length - 1];
        var t, r;

        if (m.type === "castling") {
            t = m.to;

            if (m.from.c > t.c) {
                r = cellAt(t.r, 0).querySelector("div");
                r.parentNode.removeChild(r);
                cellAt(t.r, t.c + 1).appendChild(r);
            } else {
                r = cellAt(t.r, 7).querySelector("div");
                r.parentNode.removeChild(r);
                cellAt(t.r, t.c - 1).appendChild(r);
            }
        }

    };

    var cellRowCol = function (c) {
        var m = c.id.match(/row_(\d)_col_(\d)/);
        return {
            r: Number(m[1]),
            c: Number(m[2])
        };
    };

    var drawPieces = function () {

        var drawPiece = function (r) {
            var p = game.board.pieceAt(r, c);
            document.querySelector("#row_" + r + "_col_" + c).
                innerHTML =
                "<div class=\"piece " + (p.white? "white": "black") + "\">" +
                    p.toString() +
                "</div>";
        };

        for (var c = 0; c < 8; c += 1) {
            [0, 1, 6, 7].forEach(drawPiece);
        }
    };

    var acquireGame = function (callback) {
        game = new chess.chess_Chess();
        game.reset();
        white = game.turn;

        window.game = game;
        callback();
    };

    var addClass = function (e, c) {
        var cl = (e.className || "").split(" ");
        if (!cl.some(function (v) { return v === c; })) {
            cl.push(c);
            e.className = cl.join(" ");
        }
    };

    var removeClass = function (e, c) {
        var cl = (e.className || "").split(" ");
        var ncl = [];
        cl.forEach(function (v) {
            if (v !== c) {
                ncl.push(v);
            }
        });

        e.className = ncl.join(" ");
    };

    document.addEventListener("DOMContentLoaded", function () {
        body = document.querySelector("body");
        initialize();
    });

}());