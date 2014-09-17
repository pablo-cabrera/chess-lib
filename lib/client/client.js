(function () {
    "use strict";

    var chess = window.chess;
    var game;
    var white;
    var table;
    var body;
    var gameId;
    var socket;
    var onSocketMessage;
    var logDiv;
    var promoting = false;

    var initialize = function () {
        drawLog();
        acquireGame(function () {
            setupSocket(function () {
                drawBoard();
                drawPieces();

                if (white) {
                    setupPieceCursors();
                } else {
                    onSocketMessage = handleOpponentMove;
                }

                table.addEventListener("mousedown", handleMouseDown, false);
            });
        });
    };

    var drawLog = function () {
        logDiv = document.createElement("div");
        logDiv.className = "log";
        body.appendChild(logDiv);
    };

    var log = function (l) {
        logDiv.appendChild(document.createTextNode(l));
        logDiv.appendChild(document.createElement("br"));

        logDiv.scrollTop = logDiv.scrollHeight;
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

        var div = document.createElement("div");
        div.innerHTML = html;
        table = div.firstChild;
        div.removeChild(table);
        body.appendChild(table);
        div = null;
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

    var handleMouseDown = function (e) {
        e.preventDefault();

        if (game.hasEnded || promoting || game.turn !== white) {
            return;
        }

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
            var x = Math.floor(offsetX / 50) + 1;
            var y = Math.floor(offsetY / 50) + 1;

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

    var logLastMove = function () {
        var m = game.moves[game.moves.length - 1];
        log(m.fan);

        if (game.hasEnded) {
            log(game.fan[game.fan.length - 1]);
        }
    };

    var cellAtPosition = function (e) {
        var x = Math.floor((e.clientX + body.scrollLeft - table.offsetLeft) / 50) + 1;
        var y = Math.floor((e.clientY + body.scrollTop - table.offsetTop) / 50) + 1;

        return document.querySelector(
                "tr:nth-child(" + y + ") td:nth-child(" + x + ")");
    };

    var cellAt = function (r, c) {
        return table.querySelector("#row_" + r + "_col_" + c);
    };

    var handleOpponentMove = function (cmd) {
        var from = cmd.from;
        var to = cmd.to;
        var piece = game.board.pieceAt(from.r, from.c);

        if (cmd.promotion) {
            piece.promote(to.c, getPromotionType(cmd.promotion));
        } else {
            piece.move(to.r, to.c);
        }

        game.nextTurn();

        logLastMove();
        moveBoardPiece(from, to);

        if (game.hasEnded) {
            socket.close();
        } else {
            setupPieceCursors();
        }

        onSocketMessage = function () {};
    };

    var logColor = function (w) {
        return w? "White": "Black";
    };

    var moveBoardPiece = function (from, to, piece) {
        var fromCell = cellAt(from.r, from.c);
        var toCell = cellAt(to.r, to.c);

        if (!piece) {
            piece = fromCell.querySelector("div");
            fromCell.removeChild(piece);
        }

        toCell.innerHTML = "";
        toCell.appendChild(piece);

        var m = game.moves[game.moves.length - 1];

        switch (m.type) {
        case "castling": return adjustCastling();
        case "en passant": return adjustEnPassant();
        case "promotion": return adjustPromotion();
        }
    };

    var performMove = function (piece, from, to) {
        if (!to) {
            return from.appendChild(piece);
        }

        var f = cellRowCol(from);
        var t = cellRowCol(to);
        var p = game.board.pieceAt(f.r, f.c);

        var moves = p.getAvailableMoves();

        if (!moves.some(function (m) {return m.r === t.r && m.c === t.c; })) {
            from.appendChild(piece);
            return;
        }

        removePieceCursors();
        if (p instanceof chess.chess_Pawn && t.r === (white? 7: 0)) {
            askPromotion(function (promotion) {
                sendMove(piece, f, t, promotion);
            });
        } else {
            sendMove(piece, f, t);
        }
    };

    var askPromotion = function (f) {
        promoting = true;
        var promotionDiv = document.createElement("div");
        promotionDiv.className = "promotion";
        body.appendChild(promotionDiv);

        var createOption = function (T) {
            var p = document.createElement("div");
            p.innerHTML = new T(white, game).toString();
            p.className = "piece";
            p.addEventListener("click", function () { choose(T); }, false);
            promotionDiv.appendChild(p);
        };

        var choose = function (T) {
            f(getPromotionName(T));
            body.removeChild(promotionDiv);
            promoting = false;
        };

        createOption(chess.chess_Knight);
        createOption(chess.chess_Bishop);
        createOption(chess.chess_Rook);
        createOption(chess.chess_Queen);
    };

    var getPromotionName = function (T) {
        switch (T) {
        case chess.chess_Knight: return "knight";
        case chess.chess_Bishop: return "bishop";
        case chess.chess_Rook: return "rook";
        case chess.chess_Queen: return "queen";
        }

        throw new Error("Illegal promotion");
    };

    var getPromotionType = function (t) {
        switch (t) {
        case "queen": return chess.chess_Queen;
        case "rook": return chess.chess_Rook;
        case "bishop": return chess.chess_Bishop;
        case "knight": return chess.chess_Knight;
        }

        throw new Error("Illegal promotion");
    };

    var sendMove = function (piece, from, to, promotion) {
        onSocketMessage = function (msg) {
            onSocketMessage = function () {};
            if (msg.ok) {
                var p = game.board.pieceAt(from.r, from.c);

                if (promotion) {
                    p.promote(to.c, getPromotionType(promotion));
                } else {
                    p.move(to.r, to.c);
                }

                game.nextTurn();

                logLastMove();
                moveBoardPiece(from, to, piece);
                removePieceCursors();

                if (game.hasEnded) {
                    socket.close();
                } else {
                    onSocketMessage = handleOpponentMove;
                }
            }

        };

        socket.send(JSON.stringify({
            game: gameId,
            type: "move",
            from: from,
            to: to,
            white: white,
            promotion: promotion
        }));
    };

    var adjustPromotion = function () {
        var to = game.moves[game.moves.length - 1].to;
        var div = cellAt(to.r, to.c).querySelector("div");
        div.innerHTML = game.board.pieceAt(to.r, to.c).toString();
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
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/game", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var msg = JSON.parse(xhr.responseText);

                gameId = msg.id;
                white = msg.white;

                game = new chess.chess_Chess();
                game.reset();
                callback();

                window.game = game;
            }
        };

        xhr.send(null);
    };

    var setupSocket = function (callback) {
        socket = new WebSocket("ws://" + location.hostname + ":8080");

        socket.onmessage = function (e) {
            onSocketMessage(JSON.parse(e.data));
        };

        onSocketMessage = function (cmd) {
            if (!cmd.ok) {
                throw new Error("Failed to attach socket: " + cmd.message);
            }

            onSocketMessage = function () {};
            callback();
        };

        socket.onopen = function () {
            socket.send(JSON.stringify({
                game: gameId,
                type: "attach",
                white: white
            }));
        };
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