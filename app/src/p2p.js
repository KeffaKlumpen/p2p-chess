
import { Peer } from "peerjs";

var peer = new Peer({
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
    dispatchEvent(new GenericEvent("peerCreated", id));
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

        dispatchEvent(new GenericEvent("connEstablished"));
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

    if (data.type != null && data.payload != null) {
        dispatchEvent(data);
    } else {
        console.log("Invalid payload recieved: " + JSON.stringify(data.payload));
    }
}

function dispatchEvent(event) {
    console.log("local dispatch: " + JSON.stringify(event));
    peerEvents.dispatchEvent(new CustomEvent(event.type, { detail: event.payload }));
}

export const peerEvents = new EventTarget();

export class GenericEvent {
    constructor(type, payload) {
        console.assert(typeof type === "string")
        this.type = type;
        this.payload = payload;
    }
}
export class P2pEvent extends GenericEvent {
    constructor(payload) {
        super("p2p", payload);
    }
}
export class InitEvent extends GenericEvent {
    constructor(payload) {
        super("init", payload);
    }
}
export class StateEvent extends GenericEvent {
    constructor(payload) {
        super("state", payload);
    }
}
export class GameEvent extends GenericEvent {
    constructor(payload) {
        super("game", payload);
    }
}