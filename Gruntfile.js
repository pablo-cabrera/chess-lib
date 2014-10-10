module.exports = function(grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),

        meta : {
            banner : "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
                "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" +
                "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\n\" : \"\" %>" +
                "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>;" +
                " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */"
        },

        yuitest: {
            files : ["test/**/*.js"]
        },

        jshint : {
            options : {
                /* enforcing */
                strict : true,
                bitwise : false,
                curly : true,
                eqeqeq : true,
                immed : true,
                latedef : true,
                newcap : true,
                noarg : true,
                noempty : true,
                plusplus : true,
                quotmark : "double",

                undef : true,

                /* relaxing */
                eqnull : true,
                sub : true,

                /* environment */
                node: true,
                browser: true,

                globals: { modl: false }
            },

            files : ["Gruntfile.js", "lib/**/*.js", "test/**/*.js"]
        },

        build: { target: {} },

        yuidoc : {
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
          }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks("grunt-yuitest");

    // Local tasks
    // grunt.loadTasks("tasks");

    grunt.registerMultiTask("build", "builds the client game", function () {
        var fs = require("fs");
        var path = require("path");
        var cwd = process.cwd();

        var files = [
            "/util/Util.js",
            "/chess/Piece.js",
            "/chess/Knight.js",
            "/chess/Rook.js",
            "/chess/Bishop.js",
            "/chess/Queen.js",
            "/chess/King.js",
            "/chess/Pawn.js",
            "/chess/Board.js",
            "/chess/Chess.js"
        ];

        var js = ["window.chess = {};"];

        files.forEach(function (f) {
            js.push(fs.readFileSync(path.join(cwd + "/lib" + f)));
        });

        fs.writeFileSync(path.join(cwd + "/lib/client/game.js"), js.join("\n"));
    });

    // Defaults
    grunt.registerTask("default", ["jshint", "yuitest", "build", "yuidoc"]);

};