
import { Peer } from "peerjs";
import { randInt } from "./math-helper.js";

var peer = new Peer(randInt(10), {
    config: {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            },
            {
                urls: 'turn:free.expressturn.com:3478',
                username: '000000002108492650',
                credential: 'pGblr6Sgj6o6mLOJjl9QckoJlWY=',
            }
        ],
        debug: 2
    }
});
var connection;

peer.on("open", function (id) {
    console.log("My peer ID is: " + id);
});

// Receive connection
peer.on("connection", (inConn) => {
    inConn.on("open", function () {
        onConnectionOpened(inConn)
    });
});

export function joinRoom(roomName) {
    console.log("Joining room: " + roomName);
    // Connect to a remote peer
    const outConn = peer.connect(roomName);

    outConn.on("open", () => {
        onConnectionOpened(outConn);
    });
}
export function sendData(data) {
    if (connection) {
        connection.send(data);
    } else {
        console.error("no connection!");
    }
}


function onConnectionOpened(c) {
    console.log("Connection opened to " + c.peer);
    connection = c;

    connection.on("data", (data) => {
        handleData(data);
    });

    connection.send(new GameEvent("join", { name: peer.id }));
}

function handleData(data) {
    console.log("Recieved: " + data);
}



class GameEvent {
    constructor(type, payload) {
        this.type = type;
        this.payload = payload;
    }
}