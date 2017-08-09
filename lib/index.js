"use strict";

var exports = {};

var classes = [
    "Bishop",
    "Board",
    "Chess",
    "King",
    "Knight",
    "Pawn",
    "Piece",
    "Queen",
    "Rook"
];

classes.forEach(function (c) {
    exports[c] = require("./" + c);
});

module.exports = exports;
