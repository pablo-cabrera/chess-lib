(function () {
    "use strict";

    var initialize = function () {
        acquireGame(function () {
            drawBoard();
            drawPieces();
            attachEventHandlers();
        });
    };

    var game;
    var white = true;
    var table;
    var body;

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

    var attachEventHandlers = function () {
        slice(document.querySelectorAll("div." + (white? "white": "black"))).
                forEach(function (p) {
                    p.style.cursor = "pointer";
                });

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
        p.style.top = (e.clientY - p.clientHeight / 2) + "px";
        p.style.left = (e.clientX - p.clientWidth / 2) + "px";

        var rc = cellRowCol(c);
        game.board.pieceAt(rc.r, rc.c).getAvailableMoves().
            forEach(function (m) {
                var c = table.querySelector("#row_" + m.r + "_col_" + m.c);
                addClass(c, "available");
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
            var newFocus = cellAt(e);

            if (oldFocus !== newFocus) {
                if (oldFocus) {
                    removeClass(oldFocus, "focus");
                }

                if (newFocus) {
                    addClass(newFocus, "focus");
                }
            }

            p.style.top = (e.clientY - h) + "px";
            p.style.left = (e.clientX - w) + "px";
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

            performMove(piece, from, cellAt(e));
        };

        return drop;
    };

    var cellAt = function (e) {
        var x = Math.floor((e.clientX - table.offsetLeft) / 100) + 1;
        var y = Math.floor((e.clientY - table.offsetTop) / 100) + 1;

        return document.querySelector(
                "tr:nth-child(" + y + ") td:nth-child(" + x + ")");
    };

    var performMove = function (piece, from, to) {
        if (!to) {
            return from.appendChild(piece);
        }
        var f = cellRowCol(from);
        var t = cellRowCol(to);

        try {
            game.board.pieceAt(f.r, f.c).
                move(t.r, t.c);

            to.innerHTML = "";
            to.appendChild(piece);
        } catch (e) {
            from.appendChild(piece);
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
        for (var c = 0; c < 8; c += 1) {
            [0, 1, 6, 7].forEach(function (r) {
                var p = game.board.pieceAt(r, c);
                document.querySelector("#row_" + r + "_col_" + c).
                    innerHTML =
                    "<div class=\"piece " + (p.white? "white": "black") + "\">" +
                        p.toString() +
                    "</div>";
            });
        }
    };

    var acquireGame = function (callback) {
        game = new chess.chess_Chess();
        game.reset();

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