(function() {
    "use strict";

    var
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),
        Router = require(cwd + "/lib/server/Router"),
        Controller = require(cwd + "/lib/server/Controller"),

        test = new YUITest.TestCase({

            "should answer 404 if there are no suitable controllers": function () {
                var status;
                var content;

                var r = new Router();

                r.route({}, {
                    writeHead: function (s) {
                        status = s;
                    },

                    end: function (c) {
                        content = c;
                    }
                });

                Assert.areSame(404, status);
                Assert.areSame("Not found", content);
            },

            "should not answer 404 if there is a suitable controller": function () {
                var c = new Controller();
                c.handle = function () {
                    Assert.pass();
                };

                var r = new Router();
                r.controllers["/"] = c;

                var req = { url: "/" };

                var res = {
                    writeHead: function () {
                        Assert.fail("Shouldn't call writeHead");
                    },

                    end: function () {
                        Assert.fail("Shouldn't call end");
                    }
                };

                r.route(req, res);
            },


            "should call the controller.handle method passing both the request and response": function () {
                var request = { url: "/" };
                var response = {};

                var c = new Controller();
                c.handle = function (req, res) {
                    Assert.areSame(request, req);
                    Assert.areSame(response, res);
                };

                var r = new Router();
                r.controllers["/"] = c;

                r.route(request, response);
            },

            name: "server/Router"
        });

    YUITest.TestRunner.add(test);
}());