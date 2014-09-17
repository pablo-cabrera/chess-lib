(function() {
    "use strict";

    var cwd = process.cwd();
    var Queen = require(cwd + "/lib/chess/Queen");
    var Rook = require(cwd + "/lib/chess/Rook");
    var Knight = require(cwd + "/lib/chess/Knight");
    var Bishop = require(cwd + "/lib/chess/Bishop");

    var WebSocketBroker = function (server, registry) {
        this.registry = registry;
        var that = this;

        server.on("connection", function (socket) {
            that.dispatch(socket);
        });
    };

    WebSocketBroker.prototype.dispatch = function (socket) {
        var registry = this.registry;
        socket.on("message", function (msg) {
            try {
                var cmd = JSON.parse(msg);
                var game = registry.acquire(cmd.game);

                switch (cmd.type) {
                case "attach": return attachSocket(game, cmd.white, socket);
                case "move": return performMove(game, cmd, socket);
                }
            } catch (e) {
                socket.send(JSON.stringify({
                    ok: false,
                    message: e.message
                }));
            }
        });
    };

    var attachSocket = function (game, white, socket) {
        game.attachSocket(white, socket);

        try {
            var w = game.getSocket(true);
            var b = game.getSocket(false);
            var m = JSON.stringify({ ok: true });

            w.send(m);
            b.send(m);
        } catch (e) {
            // only sends message if both sockets are present
        }
    };

    var performMove = function (game, cmd, socket) {
        var from, to, piece, promotion, chess;
        var white = cmd.white;

        if (game.getSocket(white) !== socket) {
            throw new Error("Illegal socket move");
        }

        chess = game.chess;
        from = cmd.from;
        to = cmd.to;
        piece = chess.board.pieceAt(from.r, from.c);
        promotion = cmd.promotion;

        if (promotion) {
            piece.promote(to.c, getPromotionType(promotion));
        } else {
            piece.move(to.r, to.c);
        }

        chess.nextTurn();

        game.getSocket(!white).send(JSON.stringify(cmd));
        socket.send(JSON.stringify({ ok: true }));
    };

    var getPromotionType = function (t) {
        switch (t) {
        case "queen": return Queen;
        case "rook": return Rook;
        case "bishop": return Bishop;
        case "knight": return Knight;
        }

        throw new Error("Illegal promotion");
    };

    module.exports = WebSocketBroker;

}());
