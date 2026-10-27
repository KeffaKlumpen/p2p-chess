export function legalMoves(data, row, col) {
    const piece = data[row][col]
    const color = piece.slice(0,1);
    const pieceType = piece.slice(1);

    console.log("checking legal moves for " + piece + " (color " + color + " pieceType " + pieceType + ") at [" + row + "," + col + "]");

    switch (piece) {
        case "bK":
            return legalKnightMoves(data, row, col, "b");
    }
}

function legalKnightMoves(data, row, col) {
    const moves = [];
    let x = 0;
    let y = 0;
    moves.push([x,y]);
}