import "./chessboard.js";
import { renderColor, rerender, setRenderColor } from "./chessboard.js";
import { doMove, Move, boardEvents, initializeGame, getBoardData } from "./engine.js";
import "./math-helper.js";
import { peerEvents, GameEvent, StateEvent, InitEvent } from "./p2p.js";
import { joinRoom, sendData } from "./p2p.js";


let btn = document.getElementById("joinBtn");
btn.onclick = () => joinRoom(document.getElementById("roomInput").value);
document.getElementById("msg").onclick = () => sendData(new GameEvent({ detail: new Move([0,0], [7,7], undefined) }));

peerEvents.addEventListener('game', (e) => {
    doMove(e.detail);
});

peerEvents.addEventListener('connEstablished', (e) => {
    console.log("connestablished: " + JSON.stringify(e));
    initializeGame();
    sendData(new InitEvent(getBoardData()));
});
peerEvents.addEventListener('init', (e) => {
    setRenderColor("black"); 
    initializeGame(e.detail);
})

boardEvents.addEventListener('stateupdate', (e) => {
    rerender();
});