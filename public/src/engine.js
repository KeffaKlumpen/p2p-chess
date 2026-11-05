import { range, randomFromArray } from "./math-helper.js";

const ROWS = 8
const COLS = 8

export const chessEvents = new EventTarget();

export class Move {
    constructor(from, to, promotion) {
        this.from = from
        this.to = to
        this.promotion = promotion
    }
}

export class Engine {
    constructor() {
        this.board = _960();
        this.selected = null;
        this.chessEvents = new EventTarget();
        this.currentPlayer = "white";
        this.myColor = "white";
    }

    dispatchEvent(event) {
        console.log("local dispatch: " + JSON.stringify(event));
        this.chessEvents.dispatchEvent(new CustomEvent(event.type, { detail: event.payload }));
    }

    selectSquare(pos) {
        if (this.currentPlayer != this.myColor) {
            return { success: false, reason: "Not your turn" };
        }
        let piece = this.board[pos.x][pos.y];
        if (piece == "empty") {
            return { success: false, reason: "No piece on square" }
        } else if (getColor(piece) != this.myColor) {
            return { success: false, reason: "Not your piece" }
        }

        this.selected = pos;
        return { success: true };
    }

    legalMoves(pos) {
        console.log("Checking legal moves", pos);
        const piece = this.board[pos.x][pos.y];

        return [
            new Position(0, 0),
            new Position(1, 0),
            new Position(2, 0),
        ]
    }

    initializeGame(otherBoard) {
        if (otherBoard) {
            this.board = otherBoard;
            this.currentPlayer = "white";
            this.myColor = "black";
        } else {
            this.board = _960();
            this.currentPlayer = "white";
            this.myColor = "white";
        }

        this.dispatchEvent(new BoardStateEvent(this.board));
    }

    doMove(move) {
        console.log("Performing move: " + JSON.stringify(move));
        var moved = this.board[move.from[0]][move.from[1]];
        var target = this.board[move.to[0]][move.to[1]];

        this.board[move.from[0]][move.from[1]] = "empty";
        this.board[move.to[0]][move.to[1]] = moved;

        if (target != "empty") {
            alert(getType(target) + " SLAUGHTERED BY " + getType(moved));
        }

        console.log(JSON.stringify(this.board));
        this.dispatchEvent(new BoardStateEvent(this.board));
    }
}

class BoardStateEvent {
    constructor(boardData) {
        this.type = "stateupdate";
        this.payload = boardData;
    }
}

export class Position {
    constructor(x, y) {
        this.x = (x + 8) % 8;
        this.y = (y + 8) % 8;
    }
}

function getColor(piece) {
    return piece.slice(0, 1);
}
function getType(piece) {
    return piece.slice(0);
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