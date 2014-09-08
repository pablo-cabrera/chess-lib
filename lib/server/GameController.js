(function() {
    "use strict";

    var cwd = process.cwd();
    var Controller = require(cwd + "/lib/server/Controller");
    var Util = require(cwd + "/lib/util/Util");

    var GameController = function () {};

    Util.extend(GameController, Controller);

    GameController.prototype.handle = function (req, res) {
        res.writeHead(200, {"Content-type": "text/plain"});
        res.end("Game");
    };

    module.exports = GameController;
}());