import toast from './hcg-toast/hcg-toast.js';
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
        this.currentPlayer = "w";
        this.myColor = "w";
    }

    dispatchEvent(event) {
        console.log("local dispatch: " + JSON.stringify(event));
        this.chessEvents.dispatchEvent(new CustomEvent(event.type, { detail: event.payload }));
    }

    selectSquare(pos) {
        if (this.currentPlayer != this.myColor) {
            return { success: false, reason: "Not your turn" };
        }
        const piece = this.board[pos.x][pos.y];
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
        const legalMoves = [];

        if (piece == "empty") {
            return legalMoves;
        }

        const type = getType(piece)
        switch (type) {
            case "K": {
                const moves = [...allDiagonals, ...allStraights]
                    .map(m => ({ ...m, length: 1 }));
                legalMoves.push(...this.calcLegalMoves(pos, moves));
                break;
            }
            case "P": {
                console.log("checking pawn moves")
                const col = getColor(piece)
                const moveDist = (col == "w" && pos.x == 6) || (col == "b" && pos.x == 1) ? 2 : 1;
                const xDirection = col == "w" ? -1 : 1;
                const moves = [
                    { type: "glide", walk: true, attack: false, dir: [xDirection, 0], length: moveDist },
                    { type: "jump", walk: false, attack: true, positions: [[xDirection, 1], [xDirection, -1]] },
                ];
                legalMoves.push(...this.calcLegalMoves(pos, moves));
                break;
            }
            case "B": {
                legalMoves.push(...this.calcLegalMoves(pos, allDiagonals));
                break;
            }
            case "R": {
                legalMoves.push(...this.calcLegalMoves(pos, allStraights));
                break;
            }
            case "Q": {
                legalMoves.push(...this.calcLegalMoves(pos, allDiagonals.concat(allStraights)));
                break;
            }
            case "N": {
                const moves = [
                    { type: "jump", walk: true, attack: true, positions: [[2, 1], [-2, 1]] }
                ]
                legalMoves.push(...this.calcLegalMoves(pos, moves));
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
            this.currentPlayer = "w";
            this.myColor = "b";
        } else {
            this.board = _960();
            this.currentPlayer = "w";
            this.myColor = "w";
        }

        this.dispatchEvent(new BoardStateEvent(this.board));
    }

    tryMove(move) {
        console.log("Performing move: " + JSON.stringify(move));
        const moved = this.board[move.from.x][move.from.y];
        const target = this.board[move.to.x][move.to.y];
        const movedCol = getColor(moved);

        console.log(moved, target, movedCol, move.promotion);

        if (movedCol != this.currentPlayer) {
            return "turnOrder";
        }

        if (move.promotion == null && getType(moved) == "P") {
            if (movedCol == "w" && move.to.x == 0 || movedCol == "b" && move.to.x == 7) {
                return "promotion";
            }
        }

        this.board[move.from.x][move.from.y] = "empty";
        this.board[move.to.x][move.to.y] = move.promotion == undefined ? moved : movedCol + move.promotion;

        if (target != "empty") {
            if (getType(target) == "K") {
                alert(movedCol == "w" ? "WHITE" : "BLACK" + " WINS!")
            }
            toast.success(target + " SLAUGHTERED BY " + moved);
        }

        this.currentPlayer = this.currentPlayer == "w" ? "b" : "w";
        this.dispatchEvent(new BoardStateEvent(this.board));
        return "success";
    }

    calcLegalMoves(pos, moveList) {
        const col = getColor(this.getPiece(pos.x, pos.y));
        const moves = []
        moveList.forEach(move => {
            if (move.type == "jump") {
                move.positions
                    .map(relativePos => [relativePos[0] + pos.x, relativePos[1] + pos.y])
                    .forEach(tarPos => {
                        const tarPiece = this.getPiece(tarPos[0], [tarPos[1]]);
                        console.log("jump", move.attack, tarPos, tarPiece);
                        if (tarPiece == null) {
                            return;
                        }
                        if ((move.walk && tarPiece == "empty") || (move.attack && tarPiece != "empty" && getColor(tarPiece) != col)) {
                            moves.push(new Position(tarPos[0], tarPos[1]));
                        }
                    })
            } else if (move.type == "glide") {
                let tarPos = [pos.x + move.dir[0], pos.y + move.dir[1]];
                let tarPiece = this.getPiece(tarPos[0], tarPos[1]);
                let steps = 1;
                while (tarPiece != null && (move.length == null || steps <= move.length)) {
                    const tarCol = getColor(tarPiece);
                    if (tarCol == col) {
                        break;
                    }
                    if ((move.walk && tarPiece == "empty")) {
                        moves.push(new Position(tarPos[0], tarPos[1]));
                    } else if (move.attack && getColor(tarPiece) != col) {
                        moves.push(new Position(tarPos[0], tarPos[1]));
                        break;
                    }
                    tarPos = [tarPos[0] + move.dir[0], tarPos[1] + move.dir[1]];
                    tarPiece = this.getPiece(tarPos[0], tarPos[1]);
                    steps++;
                }
            }
        });
        return moves;
    }

    getPiece(x, y) {
        if (x < 0 || x >= ROWS || y < 0 || y >= COLS)
            return null;

        return this.board[x][y];
    }
}

const allDiagonals = [
    { type: "glide", walk: true, attack: true, dir: [1, 1] },
    { type: "glide", walk: true, attack: true, dir: [1, -1] },
    { type: "glide", walk: true, attack: true, dir: [-1, -1] },
    { type: "glide", walk: true, attack: true, dir: [-1, 1] },
];
const allStraights = [
    { type: "glide", walk: true, attack: true, dir: [1, 0] },
    { type: "glide", walk: true, attack: true, dir: [-1, 0] },
    { type: "glide", walk: true, attack: true, dir: [0, 1] },
    { type: "glide", walk: true, attack: true, dir: [0, -1] },
]

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

export function getColor(piece) {
    return piece.slice(0, 1);
}
export function getType(piece) {
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