modl.
uses("/chess/Chess").
uses("/server/Game").
unit(function (module, Chess, Game) {
    "use strict";

    var GameRegistry = function () {
        this.games = {};
        this.waiting = undefined;
        this.next = 0;
    };

    GameRegistry.prototype.createId = function () {
        this.next += 1;
        return String(this.next);
    };

    GameRegistry.prototype.newGame = function () {
        var id = this.createId();
        var game = new Game(id);

        this.waiting = game;
        this.games[id] = game;

        return game;
    };

    GameRegistry.prototype.acquire = function (id) {
        var g = this.games[id];

        if (!g) {
            throw new Error("Unknown game: " + id);
        }


        return g;
    };

    module.exports = GameRegistry;
});
