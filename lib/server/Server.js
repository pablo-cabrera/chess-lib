modl.
unit(function (module) {
    "use strict";

    var Server = function (router, http) {
        this.server = http.createServer(function (req, res) {
            router.route(req, res);
        });
    };

    Server.prototype.listen = function (port, ip) {
        this.server.listen(port, ip);
    };

    module.exports = Server;
});