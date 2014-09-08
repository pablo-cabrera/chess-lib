var fs = require("fs");
var http = require("http");
var path = require("path");

var cwd = process.cwd();

var Router = require(cwd + "/lib/server/Router");
var Server = require(cwd + "/lib/server/Server");
var StaticController = require(cwd + "/lib/server/StaticController");
var GameController = require(cwd + "/lib/server/GameController");

var router = new Router();

router.controllers["/game/"] = new GameController();
router.controllers["/static/"] =
        new StaticController(path.join(cwd, "/lib/client"), fs);

new Server(router, http).
    listen(80, "0.0.0.0");