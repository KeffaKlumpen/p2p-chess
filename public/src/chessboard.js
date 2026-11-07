import { getColor, Move, Position } from "./engine.js";
import { GenericEvent, sendData } from "./p2p.js";

export class ChessboardUI {
    constructor(engine) {
        this.engine = engine;
        this.renderColor = "w";
        this.boardEvents = new EventTarget();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.boardEl = document.querySelector('#board-root');
        this.promotionModal = document.querySelector('#promotionModal');
    }

    rerender() {
        this.renderChessboard(this.engine.board, this.renderColor);
    }

    async squareClicked(coord) {
        console.log("ui click on " + JSON.stringify(coord));

        if (this.selectedSquare == coord) {
            this.selectedSquare = null;
            this.legalMoves = [];
        } else {
            const dataPos = coordToDataPos(coord);

            if (this.legalMoves.some(lm => { return lm.x == dataPos.x && lm.y == dataPos.y; })) {
                console.log(dataPos, "is legal move");
                let move = new Move(coordToDataPos(this.selectedSquare), dataPos)
                let moveResult = this.engine.tryMove(move);
                if (moveResult == "promotion") {
                    const chosen = await this.getPromotionChoice();
                    move.promotion = chosen;
                    moveResult = this.engine.tryMove(move);
                }

                if (moveResult == "success") {
                    sendData(new GenericEvent("movemade", move));
                } else {
                    console.warn("Failed to make move..");
                }

                this.selectedSquare = null;
                this.legalMoves = [];
            } else if (getColor(this.engine.getPiece(dataPos.x, dataPos.y)) == this.engine.myColor) {
                this.selectedSquare = coord;
                this.legalMoves = this.engine.legalMoves(dataPos);
            } else {
                this.selectedSquare = null;
                this.legalMoves = [];
            }
        }

        this.rerender();
    }

    renderChessboard(chessData, orientation) {
        const orientedData = structuredClone(chessData);
        if (orientation == "b") {
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

    getPromotionChoice() {
        return new Promise((resolve) => {
            // Show the modal
            this.promotionModal.showModal();

            // Listen for the close event (triggered by form submit or dialog.close())
            this.promotionModal.addEventListener('close', () => {
                // modal.returnValue contains the value of the clicked button
                resolve(this.promotionModal.returnValue);
            }, { once: true }); // { once: true } auto-removes the listener after firing
        });
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
    const rank = getRank(coord)
    const col = getCol(coord)
    // rank to X
    const x = 8 - rank;
    // col to Y
    const y = cols.findIndex(c => c == col)
    // return new Position(7 - x, 7 - y);
    return new Position(x, y);
}
function uiposToCoord(x, y, renderColor) {
    if (renderColor == "w") {
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