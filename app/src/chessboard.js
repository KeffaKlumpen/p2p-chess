import { range, randomFromArray } from "./math-helper";
import { legalMoves } from "./engine";

const board = document.querySelector('#board-root');

const ROWS = 8
const COLS = 8

const defaultPieces = ["R1", "R2", "N1", "N2", "B1", "B2", "Q", "K"]

const gameState = {
    myColor: "white",
    renderColor: "white",
    chessData: _960()
}

_renderChessboard(gameState.chessData, gameState.renderColor);

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

function _renderChessboard(chessData, orientation) {
    const orientedData = structuredClone(chessData);
    if (orientation == "black") {
        orientedData.reverse();
        orientedData.map(col => col.reverse())
    }

    const table = document.createElement('table');
    table.setAttribute('id', 'chessboard');
    table.setAttribute('style', 'border-collapse: collapse; border: 1px solid black;');
    board.replaceChildren(table);

    for (let i = 0; i < 8; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('td');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);

            const piece = orientedData[i][j];
            if (piece != "empty") {
                const imgEl = document.createElement('img');
                imgEl.setAttribute('src', `./chesspieces/cburnett/${piece}.svg`);
                imgEl.setAttribute('alt', piece);
                imgEl.setAttribute('style', 'width: 40px; height: 40px;');
                cell.onclick = () => {
                    cellClicked(i, j);
                }
                cell.appendChild(imgEl);
            }

            cell.setAttribute('style', 'width: 50px; height: 50px; border: 1px solid black; text-align: center;');


            if ((i + j) % 2 === 0) {
                cell.setAttribute('style', 'background-color: white; width: 50px; height: 50px; border: 1px solid black; text-align: center;');
            } else {
                cell.setAttribute('style', 'background-color: gray; width: 50px; height: 50px; border: 1px solid black; text-align: center;');
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

document.getElementById("swap").onclick = () => {
    gameState.renderColor = gameState.renderColor == "white" ? "black" : "white"
    console.log("render with: " + gameState.renderColor);
    _renderChessboard(gameState.chessData, gameState.renderColor)
};

function cellClicked(i, j) {
    legalMoves(gameState.chessData, i, j);
}