import { Position } from "./engine.js";

export class ChessboardUI {
    constructor(engine) {
        this.engine = engine;
        this.renderColor = "white";
        this.boardEvents = new EventTarget();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.boardEl = document.querySelector('#board-root');
    }

    rerender() {
        this.renderChessboard(this.engine.board, this.renderColor);
    }

    squareClicked(coord) {
        console.log("ui click on " + JSON.stringify(coord));

        if (this.selectedSquare == coord) {
            this.selectedSquare = null;
            this.legalMoves = [];
        } else {
            this.selectedSquare = coord;
            const dataPos = coordToDataPos(coord);
            this.legalMoves = this.engine.legalMoves(dataPos);
        }

        this.rerender();
    }

    renderChessboard(chessData, orientation) {
        const orientedData = structuredClone(chessData);
        if (orientation == "black") {
            orientedData.reverse();
            orientedData.map(col => col.reverse())
        }

        const table = document.createElement('table');
        table.setAttribute('id', 'chessboard');
        table.setAttribute('style', 'border-collapse: collapse; border: 1px solid black;');
        this.boardEl.replaceChildren(table);

        for (let i = 0; i < 8; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 8; j++) {
                const cell = document.createElement('td');
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                cell.className = (i + j) % 2 === 0 ? "cell white" : "cell gray";

                const currentCoord = uiposToCoord(i, j, this.renderColor);
                cell.onclick = () => {
                    this.squareClicked(currentCoord);
                }
                cell.title = `x${i},y${j}`

                const piece = orientedData[i][j];
                if (piece != "empty") {
                    const imgEl = document.createElement('img');
                    imgEl.setAttribute('src', `static/chesspieces/cburnett/${piece}.svg`);
                    imgEl.setAttribute('alt', piece);
                    imgEl.setAttribute('style', 'width: 40px; height: 40px;');
                    cell.appendChild(imgEl);
                }

                // Bestäm grundfärg (vit eller grå rullande)
                if (this.selectedSquare === currentCoord) {
                    cell.classList.add("selected");
                }

                const currentDataPos = coordToDataPos(currentCoord, this.renderColor);
                const isLegalMove = this.legalMoves.some(pos => pos.x === currentDataPos.x && pos.y === currentDataPos.y);

                if (isLegalMove) {
                    cell.classList.add("legal");
                }

                row.appendChild(cell);
            }
            table.appendChild(row);
        }
    }
}


let cols = ["A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",]
function getRank(coord) {
    console.assert(coord.length == 2);
    return coord.slice(1, 2);
}
function getCol(coord) {
    console.assert(coord.length == 2);
    return coord.slice(0, 1);
}
function coordToDataPos(coord) {
    var rank = getRank(coord)
    let col = getCol(coord)
    // rank to X
    let x = 8 - rank;
    // col to Y
    let y = cols.findIndex(c => c == col)
    // return new Position(7 - x, 7 - y);
    return new Position(x, y);
}
function uiposToCoord(x, y, renderColor) {
    if (renderColor == "white") {
        return `${col(y)}${rank(x)}`;
    } else {
        return `${col(7 - y)}${rank(7 - x)}`;
    }
}
function col(y) {
    return cols[y]
}
function rank(x) {
    return 8 - x;
}

// document.getElementById("swap").onclick = () => {
//     renderColor = renderColor == "white" ? "black" : "white"
//     console.log("render with: " + renderColor);
//     rerender();
// };