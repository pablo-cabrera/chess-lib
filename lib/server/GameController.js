(function() {
    "use strict";

    var cwd = process.cwd();
    var Controller = require(cwd + "/lib/server/Controller");
    var Util = require(cwd + "/lib/util/Util");

    var GameController = function (registry) {
        this.registry = registry;
    };

    Util.extend(GameController, Controller);

    GameController.prototype.handle = function (req, res) {
        var game = this.registry.waiting;
        var white;

        if (game) {
            white = false;
            this.registry.waiting = undefined;
        } else {
            white = true;
            game = this.registry.newGame();
        }

        res.writeHead(200, { "Content-type": "text/plain" });
        res.end(JSON.stringify({
            id: game.id,
            white: white
        }));
    };

    module.exports = GameController;
}());