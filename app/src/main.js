import "./chessboard.js";
import "./math-helper.js";
import "./p2p.js";
import { joinRoom, sendData } from "./p2p.js";


let btn = document.getElementById("joinBtn");
btn.onclick = () => joinRoom(document.getElementById("roomInput").value);
document.getElementById("msg").onclick = () => sendData("pingping");