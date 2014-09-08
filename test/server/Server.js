(function() {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),
        Server = require(cwd + "/lib/server/Server"),

        test = new YUITest.TestCase({

            "the constructor should create a server": function () {
                var http = {
                    createServer: function (f) {
                        Assert.isFunction(f);
                    }
                };

                var s = new Server({}, http);
            },

            "the created server should call the router, passing the request and response": function () {
                var callback;
                var http = {
                    createServer: function (f) {
                        callback = f;
                        return {};
                    }
                };

                var request = {};
                var response = {};

                var router = {
                    route: function (req, res) {
                        Assert.areSame(request, req);
                        Assert.areSame(response, res);
                    }
                };

                new Server(router, http);

                callback(request, response);
            },

            "should call the internal listen method passing both the port and ip": function () {
                var http = {
                    createServer: function (f) {
                        return {
                            listen: function(port, ip) {
                                Assert.areSame(80, port);
                                Assert.areSame("0.0.0.0", ip);
                            }
                        };
                    }
                };

                new Server({}, http).listen(80, "0.0.0.0");
            },

            name: "server/Server"
        });

    YUITest.TestRunner.add(test);
}());