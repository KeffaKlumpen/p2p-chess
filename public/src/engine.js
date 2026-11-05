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
        let legalMoves = [];

        if (piece == "empty") {
            return legalMoves;
        }

        let col = getColor(piece)
        let type = getType(piece)
        console.log(col, type);
        switch (type) {
            case "K": {
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (i == 0 && j == 0) { continue; }
                        let x = pos.x + i;
                        let y = pos.y + j;
                        let other = this.getPiece(x, y);
                        if (other == null) {
                            continue;
                        }
                        if (other == "empty" || col != getColor(other)) {
                            legalMoves.push(new Position(x, y));
                        }
                    }
                }
                break;
            }
            case "P": {
                console.log("checking pawn moves")
                let moveDist = (col == "w" && pos.x == 6) || (col == "b" && pos.x == 1) ? 2 : 1;
                let xDirection = col == "w" ? -1 : 1;
                let pawnMoves = [
                    { type: "glide", walk: true, attack: false, dir: [xDirection, 0], length: moveDist },
                    { type: "jump", walk: false, attack: true, positions: [[xDirection, 1], [xDirection, -1]] },
                ];

                pawnMoves.forEach(move => {
                    console.log("pawnmove", move);
                    if (move.type == "jump") {
                        move.positions
                            .map(relativePos => [relativePos[0] + pos.x, relativePos[1] + pos.y])
                            .forEach(tarPos => {
                                var tarPiece = this.getPiece(tarPos[0], [tarPos[1]]);
                                console.log("jump", move.attack, tarPos, tarPiece);
                                if (tarPiece == null) {
                                    return;
                                }
                                if ((move.walk && tarPiece == "empty") || (move.attack && tarPiece != "empty" && getColor(tarPiece) != col)) {
                                    legalMoves.push(new Position(tarPos[0], tarPos[1]));
                                }
                            })
                    } else if (move.type == "glide") {
                        let tarPos = [pos.x + move.dir[0], pos.y + move.dir[1]];
                        let tarPiece = this.getPiece(tarPos[0], tarPos[1]);
                        let steps = 1;
                        while (tarPiece != null && (move.length == undefined || steps <= move.length)) {
                            if ((!move.attack && tarPiece == "empty") || (move.attack && getColor(tarPiece) != col)) {
                                legalMoves.push(new Position(tarPos[0], tarPos[1]));
                            }
                            tarPos = [tarPos[0] + move.dir[0], tarPos[1] + move.dir[1]];
                            tarPiece = this.getPiece(tarPos[0], tarPos[1]);
                            steps++;
                        }
                    }
                });
                break;
            }
            default: {
                legalMoves.push(new Position(3, 3));
            }
        }

        return legalMoves;
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
        const moved = this.board[move.from.x][move.from.y];
        const target = this.board[move.to.x][move.to.y];

        this.board[move.from.x][move.from.y] = "empty";
        this.board[move.to.x][move.to.y] = moved;

        if (getType(moved) == "P") {
            // check promotion...
            const col = getColor(moved);
            if (col == "w" && move.to.x == 7 || col == "b" && move.to.x == 0) {
                // return { need Promotion Choice }
            }
        }

        if (target != "empty") {
            alert(getType(target) + " SLAUGHTERED BY " + getType(moved));
        }

        console.log(JSON.stringify(this.board));
        this.dispatchEvent(new BoardStateEvent(this.board));
    }

    getPiece(x, y) {
        if (x < 0 || x >= ROWS || y < 0 || y >= COLS)
            return null;

        return this.board[x][y];
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
    return piece.slice(1);
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