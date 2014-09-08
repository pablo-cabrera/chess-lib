(function() {
    "use strict";

    var
        path = require("path"),
        YUITest = require("yuitest"),
        Assert = YUITest.Assert,

        cwd = process.cwd(),
        StaticController = require(cwd + "/lib/server/StaticController"),
        Util = require(cwd + "/lib/util/Util"),

        test = new YUITest.TestCase({

            setUp: function () {
                this.req = {
                    url: "/static/somefile"
                };

                this.res = {
                    writeHead: function() {},
                    end: function () {}
                };

                this.fs = {
                    exists: function (f, c) { c(true); },
                    readFile: function (f, c) {
                        c(null, "content");
                    }
                };
            },

            "should look for files removing the /static prefix": function () {
                var f = {
                    type: "yo/yo",
                    content: "content"
                };

                var c = new StaticController("/", this.fs);
                c.cache["/somefile"] = f;

                var status;
                var type;
                var content;

                this.res.writeHead = function(s, h) {
                    status = s;
                    type = h["Content-type"];
                };

                this.res.end = function (c) {
                    content = c;
                };

                c.handle(this.req, this.res);

                Assert.areSame(200, status);
                Assert.areSame(f.type, type);
                Assert.areSame(f.content, content);
            },

            "should look for a file concatenating with the controller's root": function () {
                var root = "/root";

                var localFile;

                this.fs.exists = function (f, c) {
                    localFile = f;
                    c(false);
                };

                var c = new StaticController(root, this.fs);
                c.handle(this.req, this.res);

                Assert.areSame(path.join(root + "/somefile"), localFile);
            },

            "should look for files within the cache first": function () {
                this.fs.exists = function () {
                    Assert.fail("Should look within cache");
                };

                var f = {
                    type: "yo/yo",
                    content: "content"
                };

                var c = new StaticController("/", this.fs);
                c.cache["/somefile"] = f;
                c.handle(this.req, this.res);
                Assert.pass();
            },

            "should answer not found if the file doesn't exist": function () {
                this.fs.exists = function (f, c) { c(false); };

                var status;
                var type;
                var content;

                this.res.writeHead = function (s, h) {
                    status = s;
                    type = h["Content-type"];
                };

                this.res.end = function (c) {
                    content = c;
                };

                var c = new StaticController("/", this.fs);
                c.handle(this.req, this.res);

                Assert.areSame(404, status);
                Assert.areSame("text/plain", type);
                Assert.areSame("Not found", content);
            },

            "should answer not found if there is an error retrieving the file": function () {
                this.fs.readFile = function (f, c) {
                    c(new Error("fuck you!"), null);
                };

                var status;
                var type;
                var content;

                this.res.writeHead = function (s, h) {
                    status = s;
                    type = h["Content-type"];
                };

                this.res.end = function (c) {
                    content = c;
                };

                var c = new StaticController("/", this.fs);
                c.handle(this.req, this.res);

                Assert.areSame(404, status);
                Assert.areSame("text/plain", type);
                Assert.areSame("Not found", content);
            },

            "should retrieve the file and put it within the cache": function () {
                var c = new StaticController("/", this.fs);
                c.handle(this.req, this.res);

                var o = c.cache["/somefile"];
                Assert.isObject(o);
                Assert.areSame("text/plain", o.type);
                Assert.areSame("content", o.content);
            },

            "should store an html file as text/html": function () {
                var type;

                this.res.writeHead = function (s, h) {
                    type = h["Content-type"];
                };

                this.req.url += ".html";

                var c = new StaticController("/", this.fs);
                c.handle(this.req, this.res);

                Assert.areSame("text/html", type);
            },

            "should store a css file as text/css": function () {
                var type;

                this.res.writeHead = function (s, h) {
                    type = h["Content-type"];
                };

                this.req.url += ".css";

                var c = new StaticController("/", this.fs);
                c.handle(this.req, this.res);

                Assert.areSame("text/css", type);
            },

            "should store a js file as application/javascript": function () {
                var type;

                this.res.writeHead = function (s, h) {
                    type = h["Content-type"];
                };

                this.req.url += ".js";

                var c = new StaticController("/", this.fs);
                c.handle(this.req, this.res);

                Assert.areSame("application/javascript", type);
            },

            "should store files other than html, css and js as text/plain": function () {
                var type;

                this.res.writeHead = function (s, h) {
                    type = h["Content-type"];
                };

                var c = new StaticController("/", this.fs);
                c.handle(this.req, this.res);

                Assert.areSame("text/plain", type);
            },

            name: "server/StaticController"
        });

    YUITest.TestRunner.add(test);
}());