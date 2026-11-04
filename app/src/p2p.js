
import { Peer } from "peerjs";
import { randInt } from "./math-helper.js";
import { getBoardData } from "./engine.js";

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

        peerEvents.dispatchEvent(new CustomEvent("connEstablished"));
    });
}
export function sendData(data) {
    if (connection) {
        console.log("sending: " + JSON.stringify(data));
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

    sendData(new P2pEvent(peer.id))
}

function handleData(data) {
    console.log("Recieved: " + JSON.stringify(data));

    if (data.payload != null && data.payload.detail != null) {
        peerEvents.dispatchEvent(new CustomEvent(data.type, data.payload));
    } else {
        console.log("Invalid payload recieved: " + JSON.stringify(data.payload));
    }
}

export const peerEvents = new EventTarget();

export class P2pEvent {
    constructor(payload) {
        this.type = "p2p";
        this.payload = { detail: payload };
    }
}
export class InitEvent {
    constructor(payload) {
        this.type = "init";
        this.payload = { detail: payload };
    }
}
export class StateEvent {
    constructor(payload) {
        this.type = "state";
        this.payload = { detail: payload };
    }
}
export class GameEvent {
    constructor(payload) {
        this.type = "game";
        this.payload = { detail: payload };
    }
}