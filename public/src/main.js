import "./chessboard.js";
import { ChessboardUI } from "./chessboard.js";
import { Engine, Move } from "./engine.js";
// import './hcg-toast/hcg-toast.css';
import toast from './hcg-toast/hcg-toast.js';
import "./math-helper.js";
import { GameEvent, InitEvent, joinRoom, peerEvents, sendData } from "./p2p.js";

const engine = new Engine();
const ui = new ChessboardUI(engine);
engine.chessEvents.addEventListener('stateupdate', (e) => {
    ui.rerender();
});

let joinBtn = document.getElementById("joinBtn");
let joinInput = document.getElementById("roomInput");
joinInput.onclick = async () => {
    if (joinInput.value == "") {
        joinInput.value = await navigator.clipboard.readText()
            .then(val => {
                // Source - https://stackoverflow.com/a/13653180
                // Posted by Gambol, modified by community. See post 'Timeline' for change history
                // Retrieved 2026-11-05, License - CC BY-SA 4.0
                let uuidRx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (val.match(uuidRx)?.length != 1) {
                    throw new Error("Not valid UUID on clipboard");
                }
                return val;
            }).catch(err => {
                console.warn("Could not read from clipboard:", err.message);
                return "";
            });
    }
}

joinBtn.onclick = () => joinRoom(joinInput.value);
document.getElementById("msg").onclick = () => sendData(new GameEvent(new Move([0, 0], [7, 7], undefined)));

const peerLbl = document.getElementById("peerLbl");
const copyBtn = document.getElementById("copyMyId");


peerEvents.addEventListener('game', (e) => {
    engine.doMove(e.detail);
    // doMove(e.detail);
});

peerEvents.addEventListener('connEstablished', (e) => {
    console.log("connestablished: " + JSON.stringify(e.detail));
    engine.initializeGame();
    sendData(new InitEvent(engine.board));
});
peerEvents.addEventListener('peerCreated', (e) => {
    console.log("peerCreated: " + JSON.stringify(e.detail));
    peerLbl.innerHTML = `My PeerID: [${e.detail}]`;
    let copyFn = () => {
        navigator.clipboard.writeText(e.detail);
        toast.success("Copied to clipboard!")
    }
    peerLbl.onclick = copyFn;
    copyBtn.onclick = copyFn;
});
peerEvents.addEventListener('init', (e) => {
    ui.renderColor = "black";
    engine.initializeGame(e.detail);
})

ui.boardEvents.addEventListener('move', (e) => {
    // WHen you try to move, check with engine if OK
    // If OK, do move and notify peer
});

