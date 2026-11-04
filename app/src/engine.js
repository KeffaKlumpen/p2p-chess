import { range, randomFromArray, randInt } from "./math-helper";
import { peerEvents } from "./p2p";

export const ROWS = 8
export const COLS = 8

let data = null;
let currentPlayer = "white";
let myColor = "white";

export function getBoardData() {
    return data;
}
export function getCurrentPlayer() {
    return currentPlayer;
}
export function initializeGame(otherBoard) {
    if (otherBoard) {
        data = otherBoard;
        currentPlayer = "white";
        myColor = "black";
    } else {
        data = _960();
        currentPlayer = "white";
        myColor = "white";
    }

    boardEvents.dispatchEvent(new CustomEvent("stateupdate"));
}

export const boardEvents = new EventTarget();

export function legalMoves(row, col) {
    const piece = data[row][col]
    const color = getColor.piece();
    const pieceType = getType(piece);

    console.log("checking legal moves for " + piece + " (color " + color + " pieceType " + pieceType + ") at [" + row + "," + col + "]");

    switch (piece) {
        case "bK":
            return legalKnightMoves(row, col, "b");
    }
}

function legalKnightMoves(row, col) {
    const moves = [];
    let x = 0;
    let y = 0;
    moves.push([x, y]);
}

function getColor(piece) {
    return piece.slice(0, 1);
}
function getType(piece) {
    return piece.slice(0);
}

export function doMove(move) {
    console.log("Should I move: " + JSON.stringify(move));
    var moved = data[move.from[0]][move.from[1]];
    var target = data[move.to[0]][move.to[1]];

    data[move.from[0]][move.from[1]] = "empty";
    data[move.to[0]][move.to[1]] = moved;

    if (target != "empty") {
        alert(getType(target) + " SLAUGHTERED BY " + getType(moved));
    }

    boardEvents.dispatchEvent(new CustomEvent("stateupdate"));
    console.log(JSON.stringify(data));
}

export class Move {
    constructor(from, to, promotion) {
        this.from = from
        this.to = to
        this.promotion = promotion
    }
}

function _960() {
    const data = Array(ROWS).fill().map(() => Array(COLS).fill("empty"));

    const K = randomFromArray(range(1, 6));
    _place_piece_mirrored(data, K, "K");

    const R1 = randomFromArray(range(0, K - 1));
    const R2 = randomFromArray(range(K + 1, 7));
    // rooks on either side of king
    _place_piece_mirrored(data, R1, "R");
    _place_piece_mirrored(data, R2, "R");

    const emptyIndexes = range(0, 7).filter(col => data[0][col] == "empty")
    // place bishops on opposite colors
    const B1 = randomFromArray(emptyIndexes.filter(col => col % 2 == 0));
    const B2 = randomFromArray(emptyIndexes.filter(col => col % 2 == 1));
    _place_piece_mirrored(data, B1, "B");
    _place_piece_mirrored(data, B2, "B");

    const N1 = randomFromArray(range(0, 7).filter(col => data[0][col] == "empty"));
    _place_piece_mirrored(data, N1, "N");
    const N2 = randomFromArray(range(0, 7).filter(col => data[0][col] == "empty"));
    _place_piece_mirrored(data, N2, "N");
    const Q = randomFromArray(range(0, 7).filter(col => data[0][col] == "empty"));
    _place_piece_mirrored(data, Q, "Q");

    data[1] = Array(COLS).fill("bP");
    data[6] = Array(COLS).fill("wP");
    return data;
}

function _place_piece_mirrored(data, col, pieceType) {
    data[0][col] = "b" + pieceType;
    data[7][col] = "w" + pieceType;
}

function _defaultSetup() {
    const data = Array(ROWS).fill().map(() => Array(COLS).fill("empty"));
    data[0] = ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"];
    data[1] = Array(COLS).fill("bP");
    data[6] = Array(COLS).fill("wP");
    data[7] = ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"];
    return data;
}