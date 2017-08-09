module.exports = function (grunt) {
    "use strict";

    var lintFiles = ["Gruntfile.js", "lib/**/*.js", "test/cases/**/*.js"];
    var testResults = "test/results";
    var coverageResults = "test/coverage/reports";

    grunt.file.mkdir(testResults);
    grunt.option("stack", true);

    (function () {
        var task = require("grunt-gabarito");
        var gabarito = require("gabarito");
        task.instance().registerReporter("istanbul", function (reporter) {
            var IstanbulReporter = gabarito.plumbing.Reporter.descend().
            proto({
                message: function (env, msg, coverage) {
                    if (msg !== "grunt-istanbul") {
                        return;
                    }

                    grunt.file.write(
                        "test/coverage/reports/" +
                        "coverage-" + env.getName() + ".json",
                        coverage);
                }
            });

            return new IstanbulReporter();
        });
    }());

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        meta: {
            banner:
                "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
                "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" +
                "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\n\": \"\" %>" +
                "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> " +
                "<%= pkg.author.name %>;" +
                " Licensed " +
                "<%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */"
        },

        gabarito: {
            test: {
                src: [
                    "lib/Util.js",
                    "lib/Piece.js",
                    "lib/Knight.js",
                    "lib/Rook.js",
                    "lib/Bishop.js",
                    "lib/Queen.js",
                    "lib/King.js",
                    "lib/Pawn.js",
                    "lib/Board.js",
                    "lib/Chess.js",
                    "test/cases/**/*.js"
                ],

                options: {
                    environments: ["node", "phantom"],
                    reporters: [
                        "console",
                        {
                            type: "junit",
                            file: "test/results/junit-results.xml",
                            name: grunt.file.readJSON("package.json").name
                        }
                    ]
                }
            },

            instrument: {
                src: [
                    "test/coverage/instrument/lib/Util.js",
                    "test/coverage/instrument/lib/Piece.js",
                    "test/coverage/instrument/lib/Knight.js",
                    "test/coverage/instrument/lib/Rook.js",
                    "test/coverage/instrument/lib/Bishop.js",
                    "test/coverage/instrument/lib/Queen.js",
                    "test/coverage/instrument/lib/King.js",
                    "test/coverage/instrument/lib/Pawn.js",
                    "test/coverage/instrument/lib/Board.js",
                    "test/coverage/instrument/lib/Chess.js",
                    "test/cases/Bishop.js",
                    "test/cases/Board.js",
                    "test/cases/Chess.js",
                    "test/cases/King.js",
                    "test/cases/Knight.js",
                    "test/cases/Pawn.js",
                    "test/cases/Piece.js",
                    "test/cases/Queen.js",
                    "test/cases/Rook.js",
                    "test/cases/istanbul.js"
                ],

                options: {
                    environments: ["node", "phantom"],
                    reporters: [
                        "console",
                        {
                            type: "junit",
                            file: "test/results/junit-results.xml",
                            name: grunt.file.readJSON("package.json").name
                        },
                        "istanbul"
                    ]
                }
            }
        },

        instrument: {
            files: "lib/**/*.js",
            options: {
                lazy: true,
                basePath: "test/coverage/instrument/"
            }
        },


        jshint: {
            options: {
                /* enforcing */
                strict: true,
                bitwise: false,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                plusplus: true,
                quotmark: "double",

                undef: true,

                /* relaxing */
                eqnull: true,
                sub: true,

                /* environment */
                node: true,
                browser: true
            },

            files: lintFiles
        },

        jscs: {
            src: lintFiles,
            options: {
                config: ".jscsrc"
            }
        },

        uglify: {
            dist: {
                files: {
                    "build/chess-lib.js": [
                        "lib/util/Util.js",
                        "lib/chess/Piece.js",
                        "lib/chess/Knight.js",
                        "lib/chess/Rook.js",
                        "lib/chess/Bishop.js",
                        "lib/chess/Queen.js",
                        "lib/chess/King.js",
                        "lib/chess/Pawn.js",
                        "lib/chess/Board.js",
                        "lib/chess/Chess.js"
                    ]
                }
            }
        },

        yuidoc: {
            compile: {
                name: "<%= pkg.name %>",
                description: "<%= pkg.description %>",
                version: "<%= pkg.version %>",
                url: "<%= pkg.homepage %>",
                options: {
                    paths: "lib/",
                    outdir: "docs/"
                }
            }
        },

        clean: {
            build: ["build"],
            coverage: ["test/coverage"]
        },

        makeReport: {
            src: "test/coverage/reports/**/*.json",
            options: {
                type: "lcov",
                dir: coverageResults,
                print: "detail"
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-gabarito");
    grunt.loadNpmTasks("grunt-istanbul");

    // Defaults
    grunt.registerTask("default", ["lint", "gabarito:test"]);

    grunt.registerTask("lint", ["jscs", "jshint"]);


    grunt.registerTask("coverage", [
        "clean:build",
        "clean:coverage",
        "lint",
        "instrument",
        "gabarito:instrument",
        "makeReport"
    ]);


};
