modl.
uses("/server/Controller").
uses("/util/Util").
unit(function (module, Controller, Util) {
    "use strict";

    var path = require("path");

    var StaticController = function (root, fs) {
        this.root = root;
        this.fs = fs;
        this.cache = {};
    };

    Util.extend(StaticController, Controller);

    StaticController.prototype.handle = function (req, res) {
        var f = req.url.replace(/\/static(.+)/, "$1");

        retrieveFile.call(this, f, function (f) {
            if (f) {
                res.writeHead(200, { "Content-type": f.type });
                res.end(f.content);
            } else {
                res.writeHead(404, { "Content-type": "text/plain" });
                res.end("Not found");
            }
        });
    };

    var retrieveFile = function (f, c) {
        var cache = this.cache;
        var fs = this.fs;

        if (cache.hasOwnProperty(f)) {
            return c(cache[f]);
        }

        var localFile = path.join(this.root, f);

        fs.exists(localFile, function (e) {
            if (!e) {
                return c(null);
            }

            fs.readFile(localFile, function (e, d) {
                if (e) {
                    c(null);
                } else {
                    cache[f] = {
                        type: guessContentType(f),
                        content: d
                    };

                    c(cache[f]);
                }
            });
        });
    };

    var endsWith = function (s, e) {
        return s.lastIndexOf(e) === s.length - e.length;
    };

    var guessContentType = function (f) {
        if (endsWith(f, ".js")) {
            return "application/javascript";
        } else if (endsWith(f, ".html")) {
            return "text/html";
        } else if (endsWith(f, ".css")) {
            return "text/css";
        } else {
            return "text/plain";
        }
    };

    module.exports = StaticController;
});