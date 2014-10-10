modl.
unit(function (module) {
    "use strict";

    var Router = function () {
        this.controllers = {};
    };

    Router.prototype.route = function (req, res) {
        var controllers = this.controllers;

        var found = Object.keys(controllers).
            some(function (k) {
                if (controllers.hasOwnProperty(k) &&
                            req.url.indexOf(k) === 0) {
                    controllers[k].handle(req, res);
                    return true;
                }
                return false;
        });

        if (!found) {
            res.writeHead(404);
            res.end("Not found");
        }
    };

    module.exports = Router;
});