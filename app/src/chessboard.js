import { legalMoves, getBoardData } from "./engine";

const board = document.querySelector('#board-root');

export const ROWS = 8
export const COLS = 8

let renderColor = "white";
export function setRenderColor(color) {
    renderColor = color;
}

// _renderChess board(getBoardData(), gameState.renderColor);

export function rerender() {
    console.log("render board");
    _renderChessboard(getBoardData(), renderColor);
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
    rerender();
};

function cellClicked(i, j) {
    if (renderColor == "white") {
        console.log("ui click on " + i + "," + j);
    } else {
        console.log("ui click on " + (7 - i) + "," + (7 - j));
    }
    // legalMoves(gameState.chessData, i, j);
}