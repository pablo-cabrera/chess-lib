var fs = require("fs");
var http = require("http");
var path = require("path");
var ws = require("ws");

var cwd = process.cwd();

var Router = require(cwd + "/lib/server/Router");
var Server = require(cwd + "/lib/server/Server");
var StaticController = require(cwd + "/lib/server/StaticController");
var GameController = require(cwd + "/lib/server/GameController");
var GameRegistry = require(cwd + "/lib/server/GameRegistry");
var WebSocketBroker = require(cwd + "/lib/server/WebSocketBroker");

var router = new Router();

var registry = new GameRegistry();
var gameCtr = new GameController(registry);

var staticPath = path.join(cwd, "/lib/client");
var staticCtr = new StaticController(staticPath, fs);

router.controllers["/game"] = gameCtr;
router.controllers["/static/"] = staticCtr;

new Server(router, http).
    listen(80, "0.0.0.0");


var wsServer = new ws.Server({ port: 8080 });
var broker = new WebSocketBroker(wsServer, registry);