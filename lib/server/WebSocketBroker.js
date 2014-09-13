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
            console.log(msg);

            try {
                var cmd = JSON.parse(msg);
                var game = registry.acquire(cmd.game);

                switch (cmd.type) {
                case "attach":
                    game.attachSocket(cmd.white, socket);

                    try {
                        var w = game.getSocket(true);
                        var b = game.getSocket(false);
                        var msg = JSON.stringify({ ok: true });

                        w.send(msg);
                        b.send(msg);
                    } catch (e) {
                        console.log(e);
                    }
                    break;

                case "move":
                    if (game.getSocket(cmd.white) !== socket) {
                        throw new Error("Illegal socket move");
                    }

                    var f = cmd.from;
                    var t = cmd.to;

                    var p = game.chess.board.pieceAt(f.r, f.c);

                    if (cmd.promotion) {
                        console.log(t.c, getPromotionType(cmd.promotion).prototype.toString());
                        p.promote(t.c, getPromotionType(cmd.promotion));
                    } else {
                        p.move(t.r, t.c);
                    }

                    game.getSocket(!cmd.white).send(msg);
                    socket.send(JSON.stringify({ ok: true }));
                    break;
                }
            } catch (e) {
                socket.send(JSON.stringify({
                    ok: false,
                    message: e.message
                }));
            }
        });
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
