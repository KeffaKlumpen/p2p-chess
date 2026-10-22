import "./chessboard.js";
import { Peer } from "peerjs";

var peer = new Peer();

peer.on("open", function (id) {
    console.log("My peer ID is: " + id);
});

function joinRoom() {
    console.log("joining room...");
    const roomName = document.getElementById("roomInput").value;
    console.log("Joining room: " + roomName);
    // Connect to a remote peer
    const conn = peer.connect(roomName);

    conn.on("open", () => {
        conn.send("Hello, peer! 👋");
    });
}
let btn = document.getElementById("joinBtn");
btn.onclick = joinRoom;


// Receive data
peer.on("connection", (conn) => {
    conn.on("data", (data) => {
        console.log("Received:", data);
    });
});