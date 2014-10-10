(function () {
    "use strict";

    var YUITest = require("yuitest"),
        util = modl.Util;

    var isTest = function (o, p) {
        if (typeof o[p] !== "function") {
            return false;
        }

        if (p.indexOf("test") === 0) {
            return true;
        }

        p = p.toLowerCase();

        return p.indexOf(" ") !== -1 && p.indexOf("should") !== -1;
    };

    module.exports = util.bond(util.that(function (that, test) {
        var newTest = {};
        var uses = test.uses || [];

        util.forEach(test, function (v, p) {
            newTest[p] = isTest(test, p)?
                function () {
                    var l = modl.loader();
                    uses.forEach(function (u) { l.uses(u); });
                    l.unit(util.args(function (args) {
                        that.resume(function () {
                            v.apply(that, args);
                        });
                    }));

                    that.wait();
                }:
                v;
        });

        YUITest.TestCase.call(this, newTest);

    }), YUITest.TestCase);

});