modl.
uses("/util/Util").
uses("/chess/Chess").
unit(function (module, Util, Chess) {
    "use strict";

    var Game = function (id) {
        this.id = id;
        this.chess = new Chess();
        this.chess.reset();
        this.sockets = {
            w: undefined,
            b: undefined
        };
    };

    Util.merge(Game.prototype, {
        attachSocket: function (w, s) {
            var n = socketName(w);
            if (this.sockets[n]) {
                throw new Error("Socket already attached: " + w);
            }

            this.sockets[n] = s;
        },

        getSocket: function (w) {
            var n = socketName(w);
            var s = this.sockets[n];

            if (s === undefined) {
                throw new Error("No socket attached: " + w);
            }

            return s;
        }
    });

    var socketName = function(w) {
        return w? "w": "b";
    };

    module.exports = Game;
});