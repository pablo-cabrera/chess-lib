modl.
uses("/server/Controller").
uses("/util/Util").
unit(function (module, Controller, Util) {
    "use strict";

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
});